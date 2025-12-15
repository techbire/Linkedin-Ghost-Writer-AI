import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============== 🔁 REFRESH TOKEN HANDLER ===============
async function getValidLinkedInToken(userId: string) {
  const { data: tokenRow, error } = await supabase
    .from("user_linkedin_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !tokenRow) throw new Error("No LinkedIn token found for user");

  const now = Date.now();
  const expiresAt = new Date(tokenRow.linkedin_token_expires_at).getTime();

  // Token expired or about to expire
  if (now > expiresAt - 60_000) {
  console.log("🔄 Refreshing LinkedIn token for user:", userId);

  const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokenRow.linkedin_refresh_token,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });

  console.log("🧾 Refresh Request Params:", Object.fromEntries(params));

  try {
    const { data } = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000, // 10s safety
    });

    console.log("✅ Refresh Success:", data);

    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || tokenRow.linkedin_refresh_token;
    const expiresIn = data.expires_in;
    const refreshExpiresIn = data.refresh_token_expires_in || 0;

    await supabase
      .from("user_linkedin_tokens")
      .update({
        linkedin_access_token: newAccessToken,
        linkedin_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        linkedin_refresh_token: newRefreshToken,
        linkedin_refresh_token_expires_at: refreshExpiresIn
          ? new Date(Date.now() + refreshExpiresIn * 1000).toISOString()
          : tokenRow.linkedin_refresh_token_expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return newAccessToken;
  } catch (err: any) {
    console.error("❌ Refresh Token Error:", err.response?.data || err.message);
    throw new Error("Failed to refresh LinkedIn access token");
  }
}

  return tokenRow.linkedin_access_token;
}



// --- Helper: Fetch LinkedIn Person URN ---
async function getLinkedInUrn(token: string): Promise<string> {
  const meResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return meResponse.data.sub
    ? `urn:li:person:${meResponse.data.sub}`
    : "";
}

// --- PDF DOCUMENT UPLOAD FUNCTIONS ---
async function initializeDocumentUpload(token: string, authorUrn: string) {
  const body = { initializeUploadRequest: { owner: authorUrn } };
  const res = await axios.post(
    "https://api.linkedin.com/rest/documents?action=initializeUpload",
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202509",
        "X-RestLi-Protocol-Version": "2.0.0",
      },
    }
  );
  return res.data.value;
}

async function uploadDocument(uploadUrl: string, file: File) {
  const buffer = await file.arrayBuffer();
  await axios.put(uploadUrl, buffer, {
    headers: { "Content-Type": "application/pdf" },
  });
}

async function createDocumentPost(
  token: string,
  authorUrn: string,
  documentUrn: string,
  message: string,
  title: string
) {
  const body = {
    author: authorUrn,
    commentary: message || "Shared a document",
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    content: { media: { title, id: documentUrn } },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };

  const res = await axios.post("https://api.linkedin.com/rest/posts", body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202509",
      "X-RestLi-Protocol-Version": "2.0.0",
    },
  });

  return res.headers["x-restli-id"];
}

// --- IMAGE/VIDEO UPLOAD ---
async function registerAsset(
  token: string,
  authorUrn: string,
  type: "IMAGE" | "VIDEO"
) {
  const recipe =
    type === "IMAGE"
      ? "urn:li:digitalmediaRecipe:feedshare-image"
      : "urn:li:digitalmediaRecipe:feedshare-video";

  const body = {
    registerUploadRequest: {
      owner: authorUrn,
      recipes: [recipe],
      serviceRelationships: [
        {
          relationshipType: "OWNER",
          identifier: "urn:li:userGeneratedContent",
        },
      ],
    },
  };

  const res = await axios.post(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-RestLi-Protocol-Version": "2.0.0",
      },
    }
  );

  return res.data;
}

async function uploadAsset(uploadUrl: string, file: File) {
  const buffer = await file.arrayBuffer();
  await axios.put(uploadUrl, buffer, {
    headers: { "Content-Type": file.type },
  });
}

// --- MAIN HANDLER ---
export async function POST(req: NextRequest) {
  try {
    let token: string | undefined;
    let userId: string | undefined;

    // 1️⃣ Try Authorization header first (used by scheduler)
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }
    console.log(token,"==================1")

    // 2️⃣ If not present, try cookie (used by frontend)
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("linkedin_token")?.value;
      userId = cookieStore.get("user_id")?.value;
    }

    // 3️⃣ Check FormData for user_id (used by scheduler)
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Unsupported content type. Expected multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    if (!userId) {
      userId = formData.get("user_id") as string;
    }
    
    // 4️⃣ Fail if still missing
    if (!token || !userId) {
      console.log("--------========", token, "---------==========", userId)
      return NextResponse.json(
        { error: "User not authenticated (missing LinkedIn token or user_id)." },
        { status: 401 }
      );
    }
    
    const accessToken = await getValidLinkedInToken(userId);
    const message = formData.get("message") as string;
    const files = formData.getAll("files") as File[];

    const authorUrn = await getLinkedInUrn(accessToken);
    console.log("Author URN:", authorUrn);

    let postId: string;

    // --- PDF POST ---
    if (files.length > 0 && files[0].type === "application/pdf") {
      const pdf = files[0];
      if (pdf.size > 100 * 1024 * 1024)
        return NextResponse.json({ error: "PDF file too large (max 100MB)." }, { status: 400 });

      const uploadData = await initializeDocumentUpload(accessToken, authorUrn);
      await uploadDocument(uploadData.uploadUrl, pdf);
      postId = await createDocumentPost(
        accessToken,
        authorUrn,
        uploadData.document,
        message,
        pdf.name.replace(".pdf", "")
      );

      console.log("✅ Document post created:", postId);
    }

    // --- IMAGE/VIDEO POST ---
    else if (files.length > 0) {
      const type = files[0].type.startsWith("video/") ? "VIDEO" : "IMAGE";
      const assetUrns: string[] = [];

      for (const file of files) {
        const res = await registerAsset(accessToken, authorUrn, type);
        const uploadUrl =
          res.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]
            .uploadUrl;
        const assetUrn = res.value.asset;

        await uploadAsset(uploadUrl, file);
        assetUrns.push(assetUrn);
      }

      const postBody = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: message },
            shareMediaCategory: type,
            media: assetUrns.map((u) => ({ status: "READY", media: u })),
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };

      const response = await axios.post("https://api.linkedin.com/v2/ugcPosts", postBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-RestLi-Protocol-Version": "2.0.0",
        },
      });

      postId = response.headers["x-restli-id"];
      console.log("✅ Media post created:", postId);
    }

    // --- TEXT-ONLY POST ---
    else {
      const body = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: message },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };

      const res = await axios.post("https://api.linkedin.com/v2/ugcPosts", body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-RestLi-Protocol-Version": "2.0.0",
        },
      });

      postId = res.headers["x-restli-id"];
      console.log("✅ Text post created:", postId);
    }

    return NextResponse.json({ success: true, postId });
  } catch (err: any) {
    console.error("=== LinkedIn Post Error ===");
    console.error(err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data?.message || err.message || "LinkedIn post failed." },
      { status: err.response?.status || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST method." }, { status: 405 });
}