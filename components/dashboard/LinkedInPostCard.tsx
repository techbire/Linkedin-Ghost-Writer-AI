import React from "react";
import { Iphone } from "../ui/iphone";
import Image from "next/image";

const Avatar = () => (
  <div className="w-10 h-10 bg-gray-300 rounded-full shrink-0" />
);

const LinkedInPostCard = ({ content }: { content: string }) => {
  return (
    <Iphone className="">
      <div className="flex flex-col h-full bg-white pt-6">
        <div className="px-5 w-full h-12 text-md font-bold py-1  flex items-center justify-between">
          <div>9:41</div>
          <div className="flex items-center h-full gap-2">
            <Image
              src="/icons/range.svg"
              height={15}
              width={15}
              alt="Cellular Connection"
            />
            <Image src="/icons/Wifi.svg" height={15} width={15} alt="Wifi" />
            <Image
              src="/icons/Battery.svg"
              height={20}
              width={20}
              alt="Battery"
            />
          </div>
        </div>
        <div className="px-4 py-2 flex items-center border-b ">
          <img src="/searchBar.svg" className="w-full h-full" alt="searchBar" />
        </div>

        <div className="p-4 flex flex-col grow">
          <div className="flex items-center mb-2">
            <Avatar />
            <div className="ml-3">
              <div className="font-semibold text-sm">
                LinkedIn User <span className="text-xs">• 1st</span>
              </div>
              <div className="text-xs text-gray-500">
                Digital Marketing | UX Design
              </div>
            </div>
          </div>
          <div className="mt-2 mb-3">
            <div className="font-semibold">
              Far far away, behind the word mountains, far from the countries
              Vokalia and Consonantia, there live the blind texts.
            </div>
            <div className="text-sm mt-2 leading-relaxed">
              Separated they live in Bookmarksgrove right at the coast of the
              Semantics, a large language ocean. <br />
              <br />
              {content.length}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto mb-2">
            <span className="text-xs text-blue-600">#UIUX</span>
            <span className="text-xs text-blue-600">#DigitalDesign</span>
            <span className="text-xs text-blue-600">#SimplicityInTech</span>
            <span className="text-xs text-blue-600">#UserExperience</span>
            <span className="text-xs text-blue-600">#DigitalHarmony</span>
          </div>

          <div className="text-xs text-blue-500 underline mb-2 cursor-pointer">
            See translation
          </div>

          <div className={`rounded-lg overflow-hidden mt-2 mb-2`}>
            <div className="bg-gradient-to-r from-black via-indigo-900 to-blue-600 p-4">
              <div className="text-xs text-gray-300 mb-1 tracking-wide">
                DD/MM | Thought Of The Day
              </div>
              <div className="font-bold text-lg text-white">
                Complexity may impress, but{" "}
                <span className="text-indigo-400">simplicity captivates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex justify-between items-center overflow-hidden bg-white">
          <img
            src="/navdBar.svg"
            className="w-full h-full object-cover "
            alt="Navigation Bar bottom"
          />
        </div>
      </div>
    </Iphone>
  );
};

export default LinkedInPostCard;
