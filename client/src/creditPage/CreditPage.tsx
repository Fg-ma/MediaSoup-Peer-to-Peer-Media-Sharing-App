import React, { useRef, useState } from "react";
import CreditItem from "./lib/CreditItem";
import CreditSection from "./lib/CreditSection";
import FgScrollbarElement from "../elements/fgScrollbarElement/FgScrollbarElement";
import FgButton from "../elements/fgButton/FgButton";
import FgSVGElement from "../elements/fgSVGElement/FgSVGElement";
import Guide from "./lib/Guide";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const menuIcon = nginxAssetServerBaseUrl + "svgs/menuIcon.svg";

export default function CreditPage() {
  const [guideOpen, setGuideOpen] = useState(false);
  const scrollingContentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <FgScrollbarElement
        direction="vertical"
        scrollingContentRef={scrollingContentRef}
        externalContentContainerRef={scrollingContentRef}
        contentContainerClassName="hide-scroll-bar w-screen h-screen flex flex-col space-y-[0.5%] p-[2%] overflow-y-auto overflow-x-hidden bg-fg-tone-black-2 items-center justify-start"
        content={
          <>
            <div className="relative flex w-full items-center justify-center font-Josefin text-4xl text-fg-white">
              Credit where credit is due
              <FgButton
                className="absolute bottom-0 right-[5%] aspect-square h-12"
                contentFunction={() => (
                  <FgSVGElement
                    className="fill-fg-white stroke-fg-white"
                    src={menuIcon}
                    attributes={[
                      { key: "width", value: "100%" },
                      { key: "height", value: "100%" },
                    ]}
                  />
                )}
                clickFunction={() => setGuideOpen((prev) => !prev)}
              />
            </div>
            <div className="h-1 min-h-1 w-[90%] rounded-[2px] bg-fg-red"></div>
            <div className="flex w-full flex-col items-start justify-center space-y-[1%] pl-[2%] pt-[4%]">
              <CreditSection
                id="creditPage_3DModels"
                title="3D Models"
                creditItems={[
                  <CreditItem
                    link="https://sketchfab.com/3d-models/beard-1-f4f8c69fc44242b698ebfcc50c8255f0"
                    content='POLYTRICITY - "Beard 1" used as "Chin beard"'
                    hoverContent='3D Model "Chin beard" -> This work is based on "Beard 1" (https://sketchfab.com/3d-models/beard-1-f4f8c69fc44242b698ebfcc50c8255f0) by POLYTRICITY (https://sketchfab.com/PolytricityLtd) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/sculptjanuary-2022-008-beard-fcbf8829e4bf481ba0538d8ca5814758"
                    content='Chaitanya Krishnan - "SculptJanuary 2022 008 Beard" used as "Classical curly beard"'
                    hoverContent='3D Model "Classical curly beard" -> This work is based on "SculptJanuary 2022 008 Beard" (https://sketchfab.com/3d-models/sculptjanuary-2022-008-beard-fcbf8829e4bf481ba0538d8ca5814758) by Chaitanya Krishnan (https://sketchfab.com/chaitanyak) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/dwarf-419053b0d03d4f78bc9aa6b667350d7c"
                    content='Benoit Gagnier - "Dwarf" used as "Full Beard"'
                    hoverContent='3D Model "Full Beard" This work is based on "Dwarf" (https://sketchfab.com/3d-models/dwarf-419053b0d03d4f78bc9aa6b667350d7c) by Benoit Gagnier (https://sketchfab.com/BenoitGagnier) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/aviator-helmet-with-goggles-1e32e931ffc34fd5a4e839cb6131347c"
                    content='Enaphets - "Aviator Helmet With Goggles" used as "Aviator goggles"'
                    hoverContent='3D Model "Aviator goggles" This work is based on "Aviator Helmet With Goggles" (https://sketchfab.com/3d-models/aviator-helmet-with-goggles-1e32e931ffc34fd5a4e839cb6131347c) by Enaphets (https://sketchfab.com/enaphets) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/toy-glasses-draft-b7bbecaa844b427db3c605b44ad0d1a3"
                    content='Nikita Kravchenko - "Toy glasses draft" used as "Toy glasses"'
                    hoverContent='3D Model "Toy glasses" This work is based on "Toy glasses draft" (https://sketchfab.com/3d-models/toy-glasses-draft-b7bbecaa844b427db3c605b44ad0d1a3) by Nikita Kravchenko (https://sketchfab.com/NicKravchenko) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/steampunk-glasses-free-fe196e7903434f22b0cb8561c21aa6cd"
                    content='Dядя Jеня - "Steampunk Glasses Free" used as "Steampunk glasses"'
                    hoverContent='3D Model "Steampunk Glasses" This work is based on "Steampunk Glasses Free" (https://sketchfab.com/3d-models/steampunk-glasses-free-fe196e7903434f22b0cb8561c21aa6cd) by Dядя Jеня (https://sketchfab.com/yarick360kabicin) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/glasses-bd1104e5ad1e4a1b9e1793a606c5be82"
                    content='drydoctoregg - "Glasses" used as "Glasses 1"'
                    hoverContent='3D Model "Glasses 1" This work is based on "Glasses" (https://sketchfab.com/3d-models/glasses-bd1104e5ad1e4a1b9e1793a606c5be82) by drydoctoregg (https://sketchfab.com/drydoctoregg) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/glasses-6167fb73abe94fbda810020123d0dbdc"
                    content='Anthony Yanez - "Glasses" used as "Glasses 2"'
                    hoverContent='3D Model "Glasses 2" This work is based on "Glasses" (https://sketchfab.com/3d-models/glasses-6167fb73abe94fbda810020123d0dbdc) by Anthony Yanez (https://sketchfab.com/paulyanez) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/glasses-007651a9450746a5b6c5a126d484cd52"
                    content='Marius.Eder - "Glasses" used as "Glasses 3"'
                    hoverContent='3D Model "Glasses 3" This work is based on "Glasses" (https://sketchfab.com/3d-models/glasses-007651a9450746a5b6c5a126d484cd52) by Marius.Eder (https://sketchfab.com/Marius.Eder) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/glasses-28cc79da0b4446bf85f362f18f4a6f9c"
                    content='VivernaNeva - "Glasses" used as "Glasses 4"'
                    hoverContent='3D Model "Glasses 4" This work is based on "Glasses" (https://sketchfab.com/3d-models/glasses-28cc79da0b4446bf85f362f18f4a6f9c). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/glasses-28cc79da0b4446bf85f362f18f4a6f9c"
                    content='VivernaNeva - "Glasses" used as "Glasses 5"'
                    hoverContent='3D Model "Glasses 5" This work is based on "Glasses" (https://sketchfab.com/3d-models/glasses-28cc79da0b4446bf85f362f18f4a6f9c). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/glasses-28cc79da0b4446bf85f362f18f4a6f9c"
                    content='VivernaNeva - "Glasses" used as "VR glasses"'
                    hoverContent='3D Model "VR glasses" This work is based on "Glasses" (https://sketchfab.com/3d-models/glasses-28cc79da0b4446bf85f362f18f4a6f9c). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/glasses-13c99a031fd84cf7aa756006e7e18a3b"
                    content='em_kei - "Glasses" used as "Glasses 6"'
                    hoverContent='3D Model "Glasses 6" This work is based on "Glasses" (https://sketchfab.com/3d-models/glasses-13c99a031fd84cf7aa756006e7e18a3b) by em_kei (https://sketchfab.com/em_kei) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/military-tactical-glasses-a2da6f0d72414168bd5b4de964812973"
                    content='Idmenthal - "Military Tactical Glasses" used as "Military tactical glasses"'
                    hoverContent='3D Model "Military Tactical Glasses" This work is based on "Military Tactical Glasses" (https://sketchfab.com/3d-models/military-tactical-glasses-a2da6f0d72414168bd5b4de964812973) by Idmenthal (https://sketchfab.com/idmental.id) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/bloody-glasses-ac8392965ad443e286ac5fa9c1a35bf5"
                    content='Amad Junaid - "Bloody Glasses" used as "Bloody glasses"'
                    hoverContent='3D Model "Bloody Glasses" This work is based on "Bloody Glasses" (https://sketchfab.com/3d-models/bloody-glasses-ac8392965ad443e286ac5fa9c1a35bf5) by Amad Junaid (https://sketchfab.com/amadjunaid) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/deal-with-it-glasses-original-1c5b6d8f43754e3ba9643b96f6e4c27e"
                    content='BasicModel - "Meme glasses" used as "Deal with it glasses [Original]"'
                    hoverContent='3D Model "Meme glasses" This work is based on "Deal with it glasses [Original]" (https://sketchfab.com/3d-models/deal-with-it-glasses-original-1c5b6d8f43754e3ba9643b96f6e4c27e) by BasicModel (https://sketchfab.com/BasicModel) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/eye-protection-glasses-0ba6c4545fe14f0d9b8406ff030fd042"
                    content='vinigor - "Eye protection glasses" used as "Eye protection glasses"'
                    hoverContent='3D Model "Eye protection glasses" This work is based on "Eye protection glasses" (https://sketchfab.com/3d-models/eye-protection-glasses-0ba6c4545fe14f0d9b8406ff030fd042) by vinigor (https://sketchfab.com/vinigor) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/sun-glasses-30a3f18ead9e452f9ab2c32151e7b2f6"
                    content='dez_z - "Sun Glasses" used as "Shades"'
                    hoverContent='3D Model "Shades" This work is based on "Sun Glasses" (https://sketchfab.com/3d-models/sun-glasses-30a3f18ead9e452f9ab2c32151e7b2f6) by dez_z (https://sketchfab.com/dez_z) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/glasses-2-e009982029d84569b653614784e0457d"
                    content='Dokono Kinokoda - "Glasses 2" used as "Default glasses"'
                    hoverContent='3D Model "Default glasses" This work is based on "Glasses 2" (https://sketchfab.com/3d-models/glasses-2-e009982029d84569b653614784e0457d) by Dokono Kinokoda (https://sketchfab.com/JunkWren) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/3d-glasses-4626aa6b4a9343b5be10f3de433cc76e"
                    content='xploid - "3d Glasses" used as "3D Glasses"'
                    hoverContent='3D Model "3D Glasses" This work is based on "3d Glasses" (https://sketchfab.com/3d-models/3d-glasses-4626aa6b4a9343b5be10f3de433cc76e) by xploid (https://sketchfab.com/xploid) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/rabbit-ears-517a37ea71d0480faae0d2d874762e3a"
                    content='neutralize - "Rabbit Ears" used as "Rabbit ears"'
                    hoverContent='3D Model "Rabbit ears" This work is based on "Rabbit Ears" (https://sketchfab.com/3d-models/rabbit-ears-517a37ea71d0480faae0d2d874762e3a) by neutralize (https://sketchfab.com/neutralize) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/stylish-hat-dark-d31ab63dbbe54c49a4c698605c23681b"
                    content='shimtimultimedia - "Stylish Hat (Dark)" used as "Stylish hat"'
                    hoverContent='3D Model "Stylish hat" This work is based on "Stylish Hat (Dark)" (https://sketchfab.com/3d-models/stylish-hat-dark-d31ab63dbbe54c49a4c698605c23681b) by shimtimultimedia (https://sketchfab.com/shimtimultimedia) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/ushanka-hat-a6abcf9811ab4d598fd62ab566683cf2"
                    content='GatenC - "Ushanka Hat" used as "Ushanka hat"'
                    hoverContent='3D Model "Ushanka hat" This work is based on "Ushanka Hat" (https://sketchfab.com/3d-models/ushanka-hat-a6abcf9811ab4d598fd62ab566683cf2) by GatenC (https://sketchfab.com/GatenC) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/seaman-hat-a5f1cf4443cf4d3dbb484ba7bb929b7f"
                    content='Alexander Kurmanin - "Seaman hat" used as "Seaman hat"'
                    hoverContent='3D Model "Seaman hat" This work is based on "Seaman hat" (https://sketchfab.com/3d-models/seaman-hat-a5f1cf4443cf4d3dbb484ba7bb929b7f) by Alexander Kurmanin (https://sketchfab.com/kurmanin) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/military-hat-6d1a59873e34488e8ea0bc7732afd7d1"
                    content='aSocialCrab - Military Hat" used as "Military hat"'
                    hoverContent='3D Model "Military hat" This work is based on "Military Hat" (https://sketchfab.com/3d-models/military-hat-6d1a59873e34488e8ea0bc7732afd7d1) by aSocialCrab (https://sketchfab.com/aSocialCrab) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/hard-hat-a1328e74b0f44b4284af05eb2aa5cfb6"
                    content='naira001 - "Hard hat" used as "Hard hat"'
                    hoverContent='3D Model "Hard hat" This work is based on "Hard hat" (https://sketchfab.com/3d-models/hard-hat-a1328e74b0f44b4284af05eb2aa5cfb6) by naira001 (https://sketchfab.com/naira001) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/hat-8508094aafb64b70bb132ce099194adf"
                    content='Siesta - "Hat" used as "Dead man hat"'
                    hoverContent='3D Model "Dead man hat" This work is based on "Hat" (https://sketchfab.com/3d-models/hat-8508094aafb64b70bb132ce099194adf) by Siesta (https://sketchfab.com/siesta) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/pbr-hoplite-helmet-a20e96b821444a8d86eea4869fe4bc84"
                    content='Ferocious Industries - "PBR Hoplite Helmet" used as "Hoplite helmet"'
                    hoverContent='3D Model "Hoplite helmet" This work is based on "PBR Hoplite Helmet" (https://sketchfab.com/3d-models/pbr-hoplite-helmet-a20e96b821444a8d86eea4869fe4bc84) by Ferocious Industries (https://sketchfab.com/ferociousindustries.matthias) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/flat-cap-bd196ab9e2d8441798177839b9e66e09"
                    content='Fridge - "Flat Cap" used as "Flat cap"'
                    hoverContent='3D Model "Flat cap" This work is based on "Flat Cap" (https://sketchfab.com/3d-models/flat-cap-bd196ab9e2d8441798177839b9e66e09) by Fridge (https://sketchfab.com/youssefdarwish01) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/asian-conical-hat-4eed68df8fb84284a91f42a6c6e4569c"
                    content='MushyDay - "Asian Conical Hat" used as "Asian conical hat"'
                    hoverContent='3D Model "Asian conical hat" This work is based on "Asian Conical Hat" (https://sketchfab.com/3d-models/asian-conical-hat-4eed68df8fb84284a91f42a6c6e4569c) by MushyDay (https://sketchfab.com/MushyDay) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/captains-hat-d9dab73466824b45b622ffd72d0586c4"
                    content={`Kurtophecles - "Captain's Hat" used as "Captain's hat"`}
                    hoverContent={`3D Model "Captain's hat" This work is based on "Captain's Hat" (https://sketchfab.com/3d-models/captains-hat-d9dab73466824b45b622ffd72d0586c4) by Kurtophecles (https://sketchfab.com/KurtShoemaker) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.`}
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/aviator-helmet-with-goggles-1e32e931ffc34fd5a4e839cb6131347c"
                    content='Enaphets - "Aviator Helmet With Goggles" used as "Aviator helmet"'
                    hoverContent='3D Model "Aviator helmet" This work is based on "Aviator Helmet With Goggles" (https://sketchfab.com/3d-models/aviator-helmet-with-goggles-1e32e931ffc34fd5a4e839cb6131347c) by Enaphets (https://sketchfab.com/enaphets) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/bicycle-hat-660183838e9f4a16b53043e639ad8609"
                    content='MR.Sirapop - "Bicycle Hat" used as "Bicycle helmet"'
                    hoverContent='3D Model "Bicycle helmet" This work is based on "Bicycle Hat" (https://sketchfab.com/3d-models/bicycle-hat-660183838e9f4a16b53043e639ad8609) by MR.Sirapop (https://sketchfab.com/Sirapop.Satemrn) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/bicorn-hat-596276d408ac40f1817bc7c1d710fa63"
                    content='alban - "Bicorn hat" used as "Bicorn hat"'
                    hoverContent='3D Model "Bicorn hat" This work is based on "Bicorn hat" (https://sketchfab.com/3d-models/bicorn-hat-596276d408ac40f1817bc7c1d710fa63) by alban (https://sketchfab.com/alban) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/helmet-049c234ae04f42adaed9b2fed13765d1"
                    content='CoFate - "Helmet" used as "Viking helmet"'
                    hoverContent='3D Model "Viking helmet" This work is based on "Helmet" (https://sketchfab.com/3d-models/helmet-049c234ae04f42adaed9b2fed13765d1) by CoFate (https://sketchfab.com/CoFate) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/chicken-hat-b0c2423e8c5f41a586193b1e25ad7610"
                    content='mickeymoose1204 - "Chicken Hat" used as "Chicken hat"'
                    hoverContent='3D Model "Chicken hat" "This work is based on "Chicken Hat" (https://sketchfab.com/3d-models/chicken-hat-b0c2423e8c5f41a586193b1e25ad7610) by mickeymoose1204 (https://sketchfab.com/mickeymoose1204) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)". Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/chef-hat-toon-0fe884ae9a734e22b6d1eb41127f1cc6"
                    content='shimtimultimedia - "Chef Hat (Toon)" used as "Chef hat"'
                    hoverContent='3D Model "Chef hat" This work is based on "Chef Hat (Toon)" (https://sketchfab.com/3d-models/chef-hat-toon-0fe884ae9a734e22b6d1eb41127f1cc6) by shimtimultimedia (https://sketchfab.com/shimtimultimedia) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/christmas-hat-b44d66b16ba543c9825af6f95bd3d678"
                    content='shedmon - "Christmas Hat" used as "Santa hat"'
                    hoverContent='3D Model "Santa hat" This work is based on "Christmas Hat" (https://sketchfab.com/3d-models/christmas-hat-b44d66b16ba543c9825af6f95bd3d678) by shedmon (https://sketchfab.com/shedmon) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/spongebob-mustache-mg-gamecube-1102cef515ae4455ace944b8bf3245d3"
                    content='Sajin Mickey Firey fan 1342 from Cheryl hill - "SpongeBob Mustache (mg) GameCube" used as "SpongeBob mustache"'
                    hoverContent='3D Model "SpongeBob mustache" This work is based on "SpongeBob Mustache (mg) GameCube" (https://sketchfab.com/3d-models/spongebob-mustache-mg-gamecube-1102cef515ae4455ace944b8bf3245d3) by Sajin Mickey Firey fan 1342 from Cheryl hill (https://sketchfab.com/cherylhill28) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/nicodemus-15fda9e154434cbc8a66bee0ccf71c65"
                    content='Brad Groatman - "Nicodemus" used as "Nicodemus mustache"'
                    hoverContent='3D Model "Nicodemus mustache" This work is based on "Nicodemus" (https://sketchfab.com/3d-models/nicodemus-15fda9e154434cbc8a66bee0ccf71c65) by Brad Groatman (https://sketchfab.com/groatman) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/mr-lunt-2000s-6b6f384685074aaaa649d9057a4ec33f"
                    content={`Janice Emmons 1990-present - "Mr. Lunt (2000's)" used as "Tiny mustache"`}
                    hoverContent={`3D Model "Tiny mustache" This work is based on "Mr. Lunt (2000's)" (https://sketchfab.com/3d-models/mr-lunt-2000s-6b6f384685074aaaa649d9057a4ec33f) by Janice Emmons 1990-present (https://sketchfab.com/JaniceEmmons1990) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.`}
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/mister-mustache-3d-illustration-92b8e860aaad4d759f2058827e39b21d"
                    content='Naweed Hesan - "Mister Mustache | 3D Illustration" used as "Pencil mustache"'
                    hoverContent='3D Model "Pencil mustache" This work is based on "Mister Mustache | 3D Illustration" (https://sketchfab.com/3d-models/mister-mustache-3d-illustration-92b8e860aaad4d759f2058827e39b21d) by Naweed Hesan (https://sketchfab.com/naweedhesan) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/dwarf-419053b0d03d4f78bc9aa6b667350d7c"
                    content='Benoit Gagnier - "Dwarf" used as "Full mustache"'
                    hoverContent='3D Model "Full mustache" This work is based on "Dwarf" (https://sketchfab.com/3d-models/dwarf-419053b0d03d4f78bc9aa6b667350d7c) by Benoit Gagnier (https://sketchfab.com/BenoitGagnier) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/ernest-grabstein-the-undertaker-72205ff7e36b4db0a249f89012322468"
                    content='Hadrien59 - "Ernest GRABSTEIN, the Undertaker" used as "Winged mustache"'
                    hoverContent='3D Model "Winged mustache" This work is based on "Ernest GRABSTEIN, the Undertaker" (https://sketchfab.com/3d-models/ernest-grabstein-the-undertaker-72205ff7e36b4db0a249f89012322468) by Hadrien59 (https://sketchfab.com/Hadrien59) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/never-mechanically-augment-your-pet-hamster-369f723e27ad44fca0f261419734a6e5"
                    content='Weta - "Never Mechanically Augment your Pet Hamster!" used as "Angry hamster"'
                    hoverContent='3D Model "Angry hamster" This work is based on "Never Mechanically Augment your Pet Hamster!" (https://sketchfab.com/3d-models/never-mechanically-augment-your-pet-hamster-369f723e27ad44fca0f261419734a6e5) by Weta (https://sketchfab.com/claysmodels) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/never-mechanically-augment-your-pet-hamster-369f723e27ad44fca0f261419734a6e5"
                    content='Weta - "Never Mechanically Augment your Pet Hamster!" used as "Brain"'
                    hoverContent='3D Model "Brain" This work is based on "Never Mechanically Augment your Pet Hamster!" (https://sketchfab.com/3d-models/never-mechanically-augment-your-pet-hamster-369f723e27ad44fca0f261419734a6e5) by Weta (https://sketchfab.com/claysmodels) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/pet-axolotl-a770545d3fd04afdb9649a03bb0f173e"
                    content={`I'mAiden - "Pet Axolotl" used as "Axolotl"`}
                    hoverContent={`3D Model "Axolotl" This work is based on "Pet Axolotl" (https://sketchfab.com/3d-models/pet-axolotl-a770545d3fd04afdb9649a03bb0f173e) by I'mAiden (https://sketchfab.com/aideniscrossing) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.`}
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/pet-rock-1da2916d9ee74c239eb681d344017f5a"
                    content='normajanethmr - "Pet Rock" used as "Pet rock"'
                    hoverContent='3D Model "Pet rock" This work is based on "Pet Rock" (https://sketchfab.com/3d-models/pet-rock-1da2916d9ee74c239eb681d344017f5a) by normajanethmr (https://sketchfab.com/normajanethmr) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/mr-waddles-gravity-falls-03de8e908cbd4c138f210ddecc10555c"
                    content='Snicks - "Mr Waddles (Gravity Falls) *__*" used as "Pig"'
                    hoverContent='3D Model "Pig" This work is based on "Mr Waddles (Gravity Falls) *__*" (https://sketchfab.com/3d-models/mr-waddles-gravity-falls-03de8e908cbd4c138f210ddecc10555c) by Snicks (https://sketchfab.com/snicks) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/illusion-of-the-future-aibo-ers-type-110-c7e78f0320294da5937da6322fce3bdf"
                    content='mozyapene - "illusion of the future / AIBO ERS type-110" used as "Robo dog"'
                    hoverContent='3D Model "Robo dog" This work is based on "illusion of the future / AIBO ERS type-110" (https://sketchfab.com/3d-models/illusion-of-the-future-aibo-ers-type-110-c7e78f0320294da5937da6322fce3bdf) by mozyapene (https://sketchfab.com/mozyapene) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/happy-hamster-58d0dec062bd4687aa24f40199a6069b"
                    content='ChrisLee - "Happy Hamster" used as "Happy hamster"'
                    hoverContent='3D Model "Happy hamster" This work is based on "Happy Hamster" (https://sketchfab.com/3d-models/happy-hamster-58d0dec062bd4687aa24f40199a6069b) by ChrisLee (https://sketchfab.com/chrisleeX) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/happy-hamster-58d0dec062bd4687aa24f40199a6069b"
                    content='ChrisLee - "Happy Hamster" used as "Buddy hamster"'
                    hoverContent='3D Model "Buddy hamster" This work is based on "Happy Hamster" (https://sketchfab.com/3d-models/happy-hamster-58d0dec062bd4687aa24f40199a6069b) by ChrisLee (https://sketchfab.com/chrisleeX) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/game-ready-mechanical-grasshopper-f444f857d9bc4d929ce7ea22dfe97cef"
                    content='VaFlee - "Game ready Mechanical-Grasshopper" used as "Mechanical grasshopper"'
                    hoverContent='3D Model "Mechanical grasshopper" This work is based on "Game ready Mechanical-Grasshopper" (https://sketchfab.com/3d-models/game-ready-mechanical-grasshopper-f444f857d9bc4d929ce7ea22dfe97cef) by VaFlee (https://sketchfab.com/VaFlee) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/cute-pet-dragon-baby-17c80b80927044a4bf95c15ed8407bcb"
                    content='outcast945 - "Cute Pet Dragon Baby" used as "Baby dragon"'
                    hoverContent='3D Model "Baby dragon" This work is based on "Cute Pet Dragon Baby" (https://sketchfab.com/3d-models/cute-pet-dragon-baby-17c80b80927044a4bf95c15ed8407bcb) by outcast945 (https://sketchfab.com/outcast945) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/bearded-dragon-d76dc0e063b242f8bde9a072a2f0b855"
                    content='RISD Nature Lab - "Bearded Dragon" used as "Bearded dragon"'
                    hoverContent='3D Model "Bearded dragon" This work is based on "Bearded Dragon" (https://sketchfab.com/3d-models/bearded-dragon-d76dc0e063b242f8bde9a072a2f0b855) by RISD Nature Lab (https://sketchfab.com/RISDNaturelab) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95"
                    content='wissemridj - "cute pets" used as "Cat 1"'
                    hoverContent='3D Model "Cat 1" This work is based on "cute pets" (https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95) by wissemridj (https://sketchfab.com/wissemridj) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95"
                    content='wissemridj - "cute pets" used as "Cat 2"'
                    hoverContent='3D Model "Cat 2" This work is based on "cute pets" (https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95) by wissemridj (https://sketchfab.com/wissemridj) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95"
                    content='wissemridj - "cute pets" used as "Red fox 1"'
                    hoverContent='3D Model "Red fox 1" This work is based on "cute pets" (https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95) by wissemridj (https://sketchfab.com/wissemridj) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95"
                    content='wissemridj - "cute pets" used as "Red fox 2"'
                    hoverContent='3D Model "Red fox 2" This work is based on "cute pets" (https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95) by wissemridj (https://sketchfab.com/wissemridj) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95"
                    content='wissemridj - "cute pets" used as "Panda 1"'
                    hoverContent='3D Model "Panda 1" This work is based on "cute pets" (https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95) by wissemridj (https://sketchfab.com/wissemridj) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95"
                    content='wissemridj - "cute pets" used as "Panda 2"'
                    hoverContent='3D Model "Panda 2" This work is based on "cute pets" (https://sketchfab.com/3d-models/cute-pets-ae27fd1884884cc19f3f86525ef8bf95) by wissemridj (https://sketchfab.com/wissemridj) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/boxer-d699377d68544a0abeabd1d4d4f31dee"
                    content='victorberdugo1 - "Boxer" used as "Boxer"'
                    hoverContent='3D Model "Boxer" This work is based on "Boxer" (https://sketchfab.com/3d-models/boxer-d699377d68544a0abeabd1d4d4f31dee) by victorberdugo1 (https://sketchfab.com/victorberdugo1) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/leminha-pet-4e5b40679cd04831ab5e2767799cba74"
                    content='LessaB3D - "Leminha (Pet)" used as "Snail"'
                    hoverContent='3D Model "Snail" This work is based on "Leminha (Pet)" (https://sketchfab.com/3d-models/leminha-pet-4e5b40679cd04831ab5e2767799cba74) by LessaB3D (https://sketchfab.com/lessaB3D) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/animated-3d-tyrannosaurus-rex-dinosaur-loop-5339a88494084a98bd2bb1104a7f48f0"
                    content='LasquetiSpice - "Animated 3D Tyrannosaurus Rex Dinosaur Loop" used as "T-Rex"'
                    hoverContent='3D Model "T-Rex" This work is based on "Animated 3D Tyrannosaurus Rex Dinosaur Loop" (https://sketchfab.com/3d-models/animated-3d-tyrannosaurus-rex-dinosaur-loop-5339a88494084a98bd2bb1104a7f48f0) by LasquetiSpice (https://sketchfab.com/LasquetiSpice) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/dodo-extinct-bird-68f873e9f9144fc4b99a8f7475bf336d"
                    content='BlueMesh - "Dodo [ Extinct Bird ]" used as "Dodo bird"'
                    hoverContent='3D Model "Dodo bird" This work is based on "Dodo [ Extinct Bird ]" (https://sketchfab.com/3d-models/dodo-extinct-bird-68f873e9f9144fc4b99a8f7475bf336d) by BlueMesh (https://sketchfab.com/VapTor) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/dinosaurs-9f25dbb0b63246dfad44835213996005"
                    content='КУКАЛЕВ - "Dinosaurs" used as "Skeleton T-Rex"'
                    hoverContent='3D Model "Skeleton T-Rex" This work is based on "Dinosaurs" (https://sketchfab.com/3d-models/dinosaurs-9f25dbb0b63246dfad44835213996005) by КУКАЛЕВ (https://sketchfab.com/po_povodu) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/dinosaur-spinosaurus-2-13fa2131ada14963bd095ea39fe39c02"
                    content='seirogan - "Dinosaur Spinosaurus 2" used as "Spinosaurus"'
                    hoverContent='3D Model "Spinosaurus" This work is based on "Dinosaur Spinosaurus 2" (https://sketchfab.com/3d-models/dinosaur-spinosaurus-2-13fa2131ada14963bd095ea39fe39c02) by seirogan (https://sketchfab.com/seirogan) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/bird-3ds-d4e05c6b66844b219c194f5feaa4c302"
                    content='gustavopujadas - "Bird 3ds" used as "Bird 1"'
                    hoverContent='3D Model "Bird 1" This work is based on "Bird 3ds" (https://sketchfab.com/3d-models/bird-3ds-d4e05c6b66844b219c194f5feaa4c302) by gustavopujadas (https://sketchfab.com/gustavopujadas) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/bird-702f93b8e9ea46b6a8e97eb1c1534b53"
                    content='Xenio - "Bird" used as "Bird 2"'
                    hoverContent='3D Model "Bird 2" This work is based on "Bird" (https://sketchfab.com/3d-models/bird-702f93b8e9ea46b6a8e97eb1c1534b53) by Xenio (https://sketchfab.com/xenio3d) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/welding-mask-4f0462e1c43e4c1db947b8eb9d37b746"
                    content='guss67 - "Welding mask" used as "Welding mask"'
                    hoverContent='3D Model "Welding mask" This work is based on "Welding mask" (https://sketchfab.com/3d-models/welding-mask-4f0462e1c43e4c1db947b8eb9d37b746) by guss67 (https://sketchfab.com/guss67) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/oni-mask-3da3c69ba3f946febda92a3610238d6b"
                    content='Batuhan13 - "Oni Mask" used as "Oni mask"'
                    hoverContent='3D Model "Oni mask" This work is based on "Oni Mask" (https://sketchfab.com/3d-models/oni-mask-3da3c69ba3f946febda92a3610238d6b) by Batuhan13 (https://sketchfab.com/Batuhan13) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/three-face-mask-0ef60297b45548dbb84f74d79f040e51"
                    content='zammon - "-Three Face Mask-" used as "Three face mask"'
                    hoverContent='3D Model "Three face mask" This work is based on "-Three Face Mask-" (https://sketchfab.com/3d-models/three-face-mask-0ef60297b45548dbb84f74d79f040e51) by zammon (https://sketchfab.com/zammon) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/tengu-mask-1389125573c747b6a3dc405efc6e412e"
                    content='zeki.kalagoglu - "Tengu Mask" used as "Tengu mask"'
                    hoverContent='3D Model "Tengu mask" This work is based on "Tengu Mask" (https://sketchfab.com/3d-models/tengu-mask-1389125573c747b6a3dc405efc6e412e) by zeki.kalagoglu (https://sketchfab.com/zeki.kalagoglu) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/mask-c5ad926ade6e44da88fa83a6c838c61c"
                    content='Muru - "Mask" used as "Demon mask"'
                    hoverContent='3D Model "Demon mask" This work is based on "Mask" (https://sketchfab.com/3d-models/mask-c5ad926ade6e44da88fa83a6c838c61c) by Muru (https://sketchfab.com/muru) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/gas-masks-8d4ac12671a0459b889a7ab631d9501e"
                    content='stayalivedudexxx - "Gas masks" used as "Gas mask 1"'
                    hoverContent='3D Model "Gas mask 1" This work is based on "Gas masks" (https://sketchfab.com/3d-models/gas-masks-8d4ac12671a0459b889a7ab631d9501e) by stayalivedudexxx (https://sketchfab.com/stayalivedudexxx) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/gas-masks-8d4ac12671a0459b889a7ab631d9501e"
                    content='stayalivedudexxx - "Gas masks" used as "Gas mask 2"'
                    hoverContent='3D Model "Gas mask 2" This work is based on "Gas masks" (https://sketchfab.com/3d-models/gas-masks-8d4ac12671a0459b889a7ab631d9501e) by stayalivedudexxx (https://sketchfab.com/stayalivedudexxx) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/gas-masks-8d4ac12671a0459b889a7ab631d9501e"
                    content='stayalivedudexxx - "Gas masks" used as "Gas mask 3"'
                    hoverContent='3D Model "Gas mask 3" This work is based on "Gas masks" (https://sketchfab.com/3d-models/gas-masks-8d4ac12671a0459b889a7ab631d9501e) by stayalivedudexxx (https://sketchfab.com/stayalivedudexxx) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/gas-masks-8d4ac12671a0459b889a7ab631d9501e"
                    content='stayalivedudexxx - "Gas masks" used as "Gas mask 4"'
                    hoverContent='3D Model "Gas mask 4" This work is based on "Gas masks" (https://sketchfab.com/3d-models/gas-masks-8d4ac12671a0459b889a7ab631d9501e) by stayalivedudexxx (https://sketchfab.com/stayalivedudexxx) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Clown mask"'
                    hoverContent='3D Model "Clown mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Woodland mask"'
                    hoverContent='3D Model "Woodland mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Wood painted mask"'
                    hoverContent='3D Model "Wood painted mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Plague doctor mask"'
                    hoverContent='3D Model "Plague doctor mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Alien mask"'
                    hoverContent='3D Model "Alien mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Masquerade mask"'
                    hoverContent='3D Model "Masquerade mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Dark knight mask"'
                    hoverContent='3D Model "Dark knight mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Zombie mask"'
                    hoverContent='3D Model "Zombie mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Creature mask"'
                    hoverContent='3D Model "Creature mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Six eyes mask"'
                    hoverContent='3D Model "Six eyes mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Cyber mask"'
                    hoverContent='3D Model "Cyber mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                  <CreditItem
                    link="https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de"
                    content='Dmitriy Dryzhak - "Masks pack 2" used as "Metal man mask"'
                    hoverContent='3D Model "Metal man mask" This work is based on "Masks pack 2" (https://sketchfab.com/3d-models/masks-pack-2-5308392d4a9f4535883d2f6d477ee9de) by Dmitriy Dryzhak (https://sketchfab.com/arvart.lit) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes were made to the original model.'
                  />,
                ]}
              />
              <CreditSection
                id="creditPage_littleBuddies"
                title="Little buddies"
                creditItems={[
                  <CreditItem
                    link="https://opengameart.org/content/animated-horse"
                    content='ScratchIO - "Animated Horse" used as "Horse"'
                    hoverContent='Sprite "Horse" -> This sprite is based on "Animated Horse" by ScratchIO (https://opengameart.org/users/scratchio), originally available at https://opengameart.org/content/animated-horse. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://gbzoid.itch.io/poring"
                    content='Gbzoid - "Poring" used as "Poring"'
                    hoverContent='Sprite "Poring" -> This sprite is based on "Poring" by Gbzoid (https://gbzoid.itch.io/), originally available at https://gbzoid.itch.io/poring. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/opp2017-sprites-characters-objects-effects"
                    content='Hapiel - "OPP2017 - Sprites, Characters, Objects, Effects" used as "Toucan"'
                    hoverContent='Sprite "Toucan" -> This sprite is based on "OPP2017 - Sprites, Characters, Objects, Effects" by Hapiel (https://opengameart.org/users/hapiel), originally available at https://opengameart.org/content/opp2017-sprites-characters-objects-effects. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also CC-BY-SA 3.0, GPL 2.0, GPL 3.0, OGA-BY 3.0, and CC0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/opp2017-sprites-characters-objects-effects"
                    content='Hapiel - "OPP2017 - Sprites, Characters, Objects, Effects" used as "Wasp"'
                    hoverContent='Sprite "Wasp" -> This sprite is based on "OPP2017 - Sprites, Characters, Objects, Effects" by Hapiel (https://opengameart.org/users/hapiel), originally available at https://opengameart.org/content/opp2017-sprites-characters-objects-effects. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also CC-BY-SA 3.0, GPL 2.0, GPL 3.0, OGA-BY 3.0, and CC0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/opp2017-sprites-characters-objects-effects"
                    content='Hapiel - "OPP2017 - Sprites, Characters, Objects, Effects" used as "Leaf bug"'
                    hoverContent='Sprite "Leaf bug" -> This sprite is based on "OPP2017 - Sprites, Characters, Objects, Effects" by Hapiel (https://opengameart.org/users/hapiel), originally available at https://opengameart.org/content/opp2017-sprites-characters-objects-effects. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also CC-BY-SA 3.0, GPL 2.0, GPL 3.0, OGA-BY 3.0, and CC0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/opp2017-sprites-characters-objects-effects"
                    content='Hapiel - "OPP2017 - Sprites, Characters, Objects, Effects" used as "Skeleton"'
                    hoverContent='Sprite "Skeleton" -> This sprite is based on "OPP2017 - Sprites, Characters, Objects, Effects" by Hapiel (https://opengameart.org/users/hapiel), originally available at https://opengameart.org/content/opp2017-sprites-characters-objects-effects. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also CC-BY-SA 3.0, GPL 2.0, GPL 3.0, OGA-BY 3.0, and CC0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Blue bird"'
                    hoverContent='Sprite "Blue bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Green bird"'
                    hoverContent='Sprite "Green bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Black bird"'
                    hoverContent='Sprite "Black bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "White bird"'
                    hoverContent='Sprite "White bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Sick bird"'
                    hoverContent='Sprite "Sick bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Dead bird"'
                    hoverContent='Sprite "Dead bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Fire bird"'
                    hoverContent='Sprite "Fire bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Flame bird"'
                    hoverContent='Sprite "Flame bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Techno bird"'
                    hoverContent='Sprite "Techno bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Red bird"'
                    hoverContent='Sprite "Red bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-bird-characters"
                    content='Mantis - "Aimated Bird Characters" used as "Rainbow bird"'
                    hoverContent='Sprite "Rainbow bird" -> This sprite is based on "Aimated Bird Characters" by Mantis (https://opengameart.org/users/mantis), originally available at https://opengameart.org/content/animated-bird-characters. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/angels-vs-demons-character-tilesets"
                    content='Bobjt - "Angels vs. Demons Character Tilesets" used as "Angel"'
                    hoverContent='Sprite "Angel" -> This sprite is based on "Angels vs. Demons Character Tilesets" by Bobjt (https://opengameart.org/users/bobjt), originally available at https://opengameart.org/content/angels-vs-demons-character-tilesets. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/angels-vs-demons-character-tilesets"
                    content='Bobjt - "Angels vs. Demons Character Tilesets" used as "Red demon"'
                    hoverContent='Sprite "Red demon" -> This sprite is based on "Angels vs. Demons Character Tilesets" by Bobjt (https://opengameart.org/users/bobjt), originally available at https://opengameart.org/content/angels-vs-demons-character-tilesets. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/angels-vs-demons-character-tilesets"
                    content='Bobjt - "Angels vs. Demons Character Tilesets" used as "White demon"'
                    hoverContent='Sprite "White demon" -> This sprite is based on "Angels vs. Demons Character Tilesets" by Bobjt (https://opengameart.org/users/bobjt), originally available at https://opengameart.org/content/angels-vs-demons-character-tilesets. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/node/11629"
                    content='daneeklu - "LPC style farm animals" used as "Chicken"'
                    hoverContent='Sprite "Chicken" -> This sprite is based on "LPC style farm animals" by daneeklu (https://opengameart.org/users/daneeklu), originally available at https://opengameart.org/node/11629. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also GPL 2.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/node/11629"
                    content='daneeklu - "LPC style farm animals" used as "Pig"'
                    hoverContent='Sprite "Pig" -> This sprite is based on "LPC style farm animals" by daneeklu (https://opengameart.org/users/daneeklu), originally available at https://opengameart.org/node/11629. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also GPL 2.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/node/11629"
                    content='daneeklu - "LPC style farm animals" used as "Wild pig"'
                    hoverContent='Sprite "Wild pig" -> This sprite is based on "LPC style farm animals" by daneeklu (https://opengameart.org/users/daneeklu), originally available at https://opengameart.org/node/11629. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also GPL 2.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/bunny-rabbit-lpc-style-for-pixelfarm"
                    content='Redshrike - "Bunny Rabbit LPC style for PixelFarm" used as "Bunny"'
                    hoverContent='Sprite "Bunny" -> This sprite is based on "Bunny Rabbit LPC style for PixelFarm" by Redshrike (https://opengameart.org/users/redshrike), originally available at https://opengameart.org/content/bunny-rabbit-lpc-style-for-pixelfarm. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also CC-BY-SA-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/node/26447"
                    content='bagzie - "Bat sprite" used as "Red bat"'
                    hoverContent='Sprite "Red bat" -> This sprite is based on "Bat sprite" by bagzie (https://opengameart.org/users/bagzie), originally available at https://opengameart.org/node/26447. Licensed under OGA-BY 3.0 (https://opengameart.org/license/oga-by-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/node/26447"
                    content='bagzie - "Bat sprite" used as "Purple bat"'
                    hoverContent='Sprite "Purple bat" -> This sprite is based on "Bat sprite" by bagzie (https://opengameart.org/users/bagzie), originally available at https://opengameart.org/node/26447. Licensed under OGA-BY 3.0 (https://opengameart.org/license/oga-by-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/classic-hero"
                    content='GrafxKid - "Classic Hero" used as "Hero"'
                    hoverContent='Sprite "Hero" -> This sprite is based on "Classic Hero" by GrafxKid (https://opengameart.org/users/grafxkid), originally available at https://opengameart.org/content/classic-hero. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/dwarves-0"
                    content='AntumDeluge - "Dwarves" used as "Black beard dwarf"'
                    hoverContent='Sprite "Black beard dwarf" -> This sprite is based on "Dwarves" by AntumDeluge (https://opengameart.org/users/antumdeluge), originally available at https://opengameart.org/content/dwarves-0. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) (also CC-BY-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/dwarves-0"
                    content='AntumDeluge - "Dwarves" used as "Blue dwarf"'
                    hoverContent='Sprite "Blue dwarf" -> This sprite is based on "Dwarves" by AntumDeluge (https://opengameart.org/users/antumdeluge), originally available at https://opengameart.org/content/dwarves-0. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) (also CC-BY-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/dwarves-0"
                    content='AntumDeluge - "Dwarves" used as "Green dwarf"'
                    hoverContent='Sprite "Green dwarf" -> This sprite is based on "Dwarves" by AntumDeluge (https://opengameart.org/users/antumdeluge), originally available at https://opengameart.org/content/dwarves-0. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) (also CC-BY-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/dwarves-0"
                    content='AntumDeluge - "Dwarves" used as "Lumberjack dwarf"'
                    hoverContent='Sprite "Lumberjack dwarf" -> This sprite is based on "Dwarves" by AntumDeluge (https://opengameart.org/users/antumdeluge), originally available at https://opengameart.org/content/dwarves-0. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) (also CC-BY-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/dwarves-0"
                    content='AntumDeluge - "Dwarves" used as "Red beard dwarf"'
                    hoverContent='Sprite "Red beard dwarf" -> This sprite is based on "Dwarves" by AntumDeluge (https://opengameart.org/users/antumdeluge), originally available at https://opengameart.org/content/dwarves-0. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) (also CC-BY-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/dwarves-0"
                    content='AntumDeluge - "Dwarves" used as "Red dwarf"'
                    hoverContent='Sprite "Red dwarf" -> This sprite is based on "Dwarves" by AntumDeluge (https://opengameart.org/users/antumdeluge), originally available at https://opengameart.org/content/dwarves-0. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) (also CC-BY-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/goblin-corps-mv-platformer-set"
                    content='MoikMellah - "Goblin Corps (MV Platformer Set)" used as "Goblin assassin"'
                    hoverContent='Sprite "Goblin assassin" -> This sprite is based on "Goblin Corps (MV Platformer Set)" by MoikMellah (https://opengameart.org/users/moikmellah), originally available at https://opengameart.org/content/goblin-corps-mv-platformer-set. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/goblin-corps-mv-platformer-set"
                    content='MoikMellah - "Goblin Corps (MV Platformer Set)" used as "Goblin guard"'
                    hoverContent='Sprite "Goblin guard" -> This sprite is based on "Goblin Corps (MV Platformer Set)" by MoikMellah (https://opengameart.org/users/moikmellah), originally available at https://opengameart.org/content/goblin-corps-mv-platformer-set. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/goblin-corps-mv-platformer-set"
                    content='MoikMellah - "Goblin Corps (MV Platformer Set)" used as "Goblin lord"'
                    hoverContent='Sprite "Goblin lord" -> This sprite is based on "Goblin Corps (MV Platformer Set)" by MoikMellah (https://opengameart.org/users/moikmellah), originally available at https://opengameart.org/content/goblin-corps-mv-platformer-set. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/goblin-corps-mv-platformer-set"
                    content='MoikMellah - "Goblin Corps (MV Platformer Set)" used as "Goblin mage"'
                    hoverContent='Sprite "Goblin mage" -> This sprite is based on "Goblin Corps (MV Platformer Set)" by MoikMellah (https://opengameart.org/users/moikmellah), originally available at https://opengameart.org/content/goblin-corps-mv-platformer-set. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/goblin-corps-mv-platformer-set"
                    content='MoikMellah - "Goblin Corps (MV Platformer Set)" used as "Goblin peasant"'
                    hoverContent='Sprite "Goblin peasant" -> This sprite is based on "Goblin Corps (MV Platformer Set)" by MoikMellah (https://opengameart.org/users/moikmellah), originally available at https://opengameart.org/content/goblin-corps-mv-platformer-set. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/goblin-corps-mv-platformer-set"
                    content='MoikMellah - "Goblin Corps (MV Platformer Set)" used as "Goblin samurai"'
                    hoverContent='Sprite "Goblin samurai" -> This sprite is based on "Goblin Corps (MV Platformer Set)" by MoikMellah (https://opengameart.org/users/moikmellah), originally available at https://opengameart.org/content/goblin-corps-mv-platformer-set. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/goblin-corps-mv-platformer-set"
                    content='MoikMellah - "Goblin Corps (MV Platformer Set)" used as "Goblin soldier"'
                    hoverContent='Sprite "Goblin soldier" -> This sprite is based on "Goblin Corps (MV Platformer Set)" by MoikMellah (https://opengameart.org/users/moikmellah), originally available at https://opengameart.org/content/goblin-corps-mv-platformer-set. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://aamatniekss.itch.io/fantasy-knight-free-pixelart-animated-character"
                    content='aamatniekss - "Fantasy Knight - Free Pixelart Animated Character" used as "Knight"'
                    hoverContent='Sprite "Knight" -> This sprite is based on "Fantasy Knight - Free Pixelart Animated Character" by aamatniekss (https://aamatniekss.itch.io/), originally available at https://aamatniekss.itch.io/fantasy-knight-free-pixelart-animated-character. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/four-characters-my-lpc-entries"
                    content='Redshrike - "Four characters: My LPC entries" used as "Baldric"'
                    hoverContent='Sprite "Baldric" -> This sprite is based on "Four characters: My LPC entries" by Redshrike (https://opengameart.org/users/redshrike), originally available at https://opengameart.org/content/four-characters-my-lpc-entries. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also CC-BY-SA-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/four-characters-my-lpc-entries"
                    content='Redshrike - "Four characters: My LPC entries" used as "Mage"'
                    hoverContent='Sprite "Mage" -> This sprite is based on "Four characters: My LPC entries" by Redshrike (https://opengameart.org/users/redshrike), originally available at https://opengameart.org/content/four-characters-my-lpc-entries. Licensed under CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0/) (also CC-BY-SA-3.0 and OGA-BY-3.0). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/musketeer-officer-caonnon-animated"
                    content='Disthron - "Musketeer Officer & Caonnon [Animated]" used as "Musket captain"'
                    hoverContent='Sprite "Musket captain" -> This sprite is based on "Musketeer Officer & Caonnon [Animated]" by Disthron (https://opengameart.org/users/disthron), originally available at https://opengameart.org/content/musketeer-officer-caonnon-animated. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/ninja-animated"
                    content='DezrasDragons - "Ninja [Animated]" used as "Ninja"'
                    hoverContent='Sprite "Ninja" -> This sprite is based on "Ninja [Animated]" by DezrasDragons (https://opengameart.org/users/dezrasdragons), originally available at https://opengameart.org/content/ninja-animated. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://zerie.itch.io/tiny-rpg-character-asset-pack"
                    content='Zerie - "Tiny RPG Character Asset Pack v1.03" used as "Orc"'
                    hoverContent='Sprite "Orc" -> This sprite is based on "Tiny RPG Character Asset Pack v1.03" by Zerie (https://zerie.itch.io/), originally available at https://zerie.itch.io/tiny-rpg-character-asset-pack. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://zerie.itch.io/tiny-rpg-character-asset-pack"
                    content='Zerie - "Tiny RPG Character Asset Pack v1.03" used as "Soldier"'
                    hoverContent='Sprite "Soldier" -> This sprite is based on "Tiny RPG Character Asset Pack v1.03" by Zerie (https://zerie.itch.io/), originally available at https://zerie.itch.io/tiny-rpg-character-asset-pack. Licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/viking-shieldmaiden-animated"
                    content='DezrasDragons - "Viking Shieldmaiden [Animated]" used as "Shield maiden"'
                    hoverContent='Sprite "Shield maiden" -> This sprite is based on "Viking Shieldmaiden [Animated]" by DezrasDragons (https://opengameart.org/users/dezrasdragons), originally available at https://opengameart.org/content/viking-shieldmaiden-animated. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-wild-animals"
                    content='ScratchIO - "Animated Wild Animals" used as "Bear"'
                    hoverContent='Sprite "Bear" -> This sprite is based on "Animated Wild Animals" by ScratchIO (https://opengameart.org/users/scratchio), originally available at https://opengameart.org/content/animated-wild-animals. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-wild-animals"
                    content='ScratchIO - "Animated Wild Animals" used as "Boar"'
                    hoverContent='Sprite "Boar" -> This sprite is based on "Animated Wild Animals" by ScratchIO (https://opengameart.org/users/scratchio), originally available at https://opengameart.org/content/animated-wild-animals. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-wild-animals"
                    content='ScratchIO - "Animated Wild Animals" used as "Deer"'
                    hoverContent='Sprite "Deer" -> This sprite is based on "Animated Wild Animals" by ScratchIO (https://opengameart.org/users/scratchio), originally available at https://opengameart.org/content/animated-wild-animals. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-wild-animals"
                    content='ScratchIO - "Animated Wild Animals" used as "Fox"'
                    hoverContent='Sprite "Fox" -> This sprite is based on "Animated Wild Animals" by ScratchIO (https://opengameart.org/users/scratchio), originally available at https://opengameart.org/content/animated-wild-animals. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-wild-animals"
                    content='ScratchIO - "Animated Wild Animals" used as "Rabbit"'
                    hoverContent='Sprite "Rabbit" -> This sprite is based on "Animated Wild Animals" by ScratchIO (https://opengameart.org/users/scratchio), originally available at https://opengameart.org/content/animated-wild-animals. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                  <CreditItem
                    link="https://opengameart.org/content/animated-wild-animals"
                    content='ScratchIO - "Animated Wild Animals" used as "Wolf"'
                    hoverContent='Sprite "Wolf" -> This sprite is based on "Animated Wild Animals" by ScratchIO (https://opengameart.org/users/scratchio), originally available at https://opengameart.org/content/animated-wild-animals. Licensed under CC0 (https://creativecommons.org/publicdomain/zero/1.0/). Modifications were made to the original.'
                  />,
                ]}
              />
              <div className="h-screen w-full"></div>
            </div>
          </>
        }
        style={{
          width: "100%",
          flexGrow: "1",
        }}
        hideScrollbar={guideOpen}
      />
      {guideOpen && <Guide setGuideOpen={setGuideOpen} />}
    </>
  );
}
