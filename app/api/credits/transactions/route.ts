import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's credit transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ transactions: transactions || [] })
  } catch (error) {
    console.error("Error in transactions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
