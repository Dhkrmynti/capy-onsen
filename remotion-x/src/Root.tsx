import { Composition, Still } from "remotion";
import { KPBanner, KPGif, KPLogo, KPPostEmpty, KPPostLadder, KPPostWho, KPPostRules, KP_GIF_LENGTH } from "./KPStills";
import { KPExplainer, KP_EXPLAINER_LENGTH } from "./KPExplainer";
import { KPTutorial, KP_TUTORIAL_LENGTH } from "./KPTutorial";
import { KPSimulation, KP_SIM_LENGTH } from "./KPSimulation";
import { GZTutorial, TUTORIAL_LENGTH } from "./Tutorial";
import { GZBanner, GZDemo, GZGif, GZLogo, GZPostMugshots, GZPostPlan, GZPostWanted, GIF_LENGTH, GZ_DEMO_LENGTH } from "./Gazette";
import { Logo, Banner } from "./Stills";
import { GifSnap, GifBoard, Demo, DEMO_LENGTH } from "./Motion";
import { PaperLegs, FirstFeeding, FirstFrog, FirstServed, Scoop, HourOne, NoSeatBack, SitterOfTheMonth } from "./Posts";
import { LoopVideo, LOOP_LENGTH } from "./Loop";
import { RBLogo, RBBanner, RBLaunch, RBMigration } from "./RBStills";
import { HLBanner, HLGif, HLLogo, HLPostHeirs, HLPostWill, HL_GIF_LENGTH } from "./HLStills";
import { HLExplainer, HL_EXPLAINER_LENGTH } from "./HLExplainer";
import { HLTutorial, HL_TUTORIAL_LENGTH } from "./HLTutorial";
import { HLSimulation, HL_SIM_LENGTH } from "./HLSimulation";

export function RemotionRoot() {
  return (
    <>
      <Still id="KPLogo" component={KPLogo} width={1080} height={1080} />
      <Still id="KPBanner" component={KPBanner} width={1500} height={500} />
      <Still id="KPPostLadder" component={KPPostLadder} width={1600} height={900} />
      <Still id="KPPostEmpty" component={KPPostEmpty} width={1600} height={900} />
      <Still id="KPPostWho" component={KPPostWho} width={1600} height={900} />
      <Still id="KPPostRules" component={KPPostRules} width={1600} height={900} />
      <Composition id="KPGif" component={KPGif} width={720} height={720} fps={30} durationInFrames={KP_GIF_LENGTH} />
      <Composition id="KPExplainer" component={KPExplainer} width={1920} height={1080} fps={30} durationInFrames={KP_EXPLAINER_LENGTH} />
      <Composition id="KPTutorial" component={KPTutorial} width={1920} height={1080} fps={30} durationInFrames={KP_TUTORIAL_LENGTH} />
      <Composition id="KPSimulation" component={KPSimulation} width={1920} height={1080} fps={30} durationInFrames={KP_SIM_LENGTH} />
      <Still id="HLLogo" component={HLLogo} width={1080} height={1080} />
      <Still id="HLBanner" component={HLBanner} width={1500} height={500} />
      <Still id="HLPostHeirs" component={HLPostHeirs} width={1600} height={900} />
      <Still id="HLPostWill" component={HLPostWill} width={1600} height={900} />
      <Composition id="HLGif" component={HLGif} width={720} height={720} fps={30} durationInFrames={HL_GIF_LENGTH} />
      <Composition id="HLExplainer" component={HLExplainer} width={1920} height={1080} fps={30} durationInFrames={HL_EXPLAINER_LENGTH} />
      <Composition id="HLSimulation" component={HLSimulation} width={1920} height={1080} fps={30} durationInFrames={HL_SIM_LENGTH} />
      <Composition id="HLTutorial" component={HLTutorial} width={1920} height={1080} fps={30} durationInFrames={HL_TUTORIAL_LENGTH} />
      <Still id="GZLogo" component={GZLogo} width={1080} height={1080} />
      <Still id="GZBanner" component={GZBanner} width={1500} height={500} />
      <Still id="GZPostPlan" component={GZPostPlan} width={1600} height={900} />
      <Still id="GZPostWanted" component={GZPostWanted} width={1600} height={900} />
      <Still id="GZPostMugshots" component={GZPostMugshots} width={1600} height={900} />
      <Composition id="GZGif" component={GZGif} width={720} height={720} fps={30} durationInFrames={GIF_LENGTH} />
      <Composition id="GZTutorial" component={GZTutorial} width={1920} height={1080} fps={30} durationInFrames={TUTORIAL_LENGTH} />
      <Composition id="GZDemo" component={GZDemo} width={1920} height={1080} fps={30} durationInFrames={GZ_DEMO_LENGTH} />
      <Still id="RBLogo" component={RBLogo} width={1080} height={1080} />
      <Still id="RBBanner" component={RBBanner} width={1500} height={500} />
      <Still id="RBLaunch" component={RBLaunch} width={1600} height={900} />
      <Still id="RBMigration" component={RBMigration} width={1600} height={900} />
      <Still id="Logo" component={Logo} width={1080} height={1080} />
      <Still id="Banner" component={Banner} width={1500} height={500} />
      <Still id="PaperLegs" component={PaperLegs} width={1600} height={900} />
      <Still id="FirstFeeding" component={FirstFeeding} width={1600} height={900} />
      <Still id="FirstFrog" component={FirstFrog} width={1600} height={900} />
      <Still id="FirstServed" component={FirstServed} width={1600} height={900} />
      <Still id="Scoop" component={Scoop} width={1600} height={900} />
      <Still id="HourOne" component={HourOne} width={1600} height={900} />
      <Still id="NoSeatBack" component={NoSeatBack} width={1600} height={900} />
      <Still id="SitterOfTheMonth" component={SitterOfTheMonth} width={1600} height={900} />
      <Composition id="GifSnap" component={GifSnap} width={720} height={720} fps={30} durationInFrames={90} />
      <Composition id="GifBoard" component={GifBoard} width={720} height={720} fps={30} durationInFrames={120} />
      <Composition id="LoopVideo" component={LoopVideo} width={1080} height={1350} fps={30} durationInFrames={LOOP_LENGTH} />
      <Composition id="Demo" component={Demo} width={1920} height={1080} fps={30} durationInFrames={DEMO_LENGTH} />
    </>
  );
}
