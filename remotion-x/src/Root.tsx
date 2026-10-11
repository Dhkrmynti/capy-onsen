import { Composition, Still } from "remotion";
import { HKBanner, HKGif, HKLogo, HKPostBoard, HKPostEmpty, HKPostRules, HKPostWho, HKHookPaper, HKHookCore, HKHookTen, HK_GIF_LENGTH } from "./HKStills";
import { HKBoardingPass, HKCycleFeature, HKForecast, HKRewardNews, REWARD_DEFAULTS } from "./HKHooks3";
import { BULLETIN_DEFAULTS, HKBoldChoice, HKBulletin, HKJobAd } from "./HKHooks2";
import { HKNews, HK_NEWS_DEFAULTS, HK_NEWS_LENGTH } from "./HKNews";
import { HKNowLevel, HKNowLive, HKNowOut, HKNowZones, HK_NOW_DEFAULTS } from "./HKNow";
import { HKExplainer, HK_EXPLAINER_LENGTH } from "./HKExplainer";
import { HKTutorial, HK_TUTORIAL_LENGTH } from "./HKTutorial";
import { HKSimulation, HK_SIM_LENGTH } from "./HKSimulation";
import { HZNowCharge, HZNowOpen, HZNowOut } from "./HZNow";
import { HZBanner, HZGif, HZLogo, HZPostEmpty, HZPostOrbit, HZPostWho, HZHookPaper, HZHookOutmass, HZHookTen, HZPostLaws, HZ_GIF_LENGTH } from "./HZStills";
import { HZExplainer, HZ_EXPLAINER_LENGTH } from "./HZExplainer";
import { HZTutorial, HZ_TUTORIAL_LENGTH } from "./HZTutorial";
import { HZSimulation, HZ_SIM_LENGTH } from "./HZSimulation";
import { KPBanner, KPGif, KPLogo, KPPostEmpty, KPPostLadder, KPPostWho, KPLogoPad, KPHookPaper, KPHookOuthold, KPHookTen, KPPostRules, KP_GIF_LENGTH } from "./KPStills";
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
      <Still id="HKRewardNews" component={HKRewardNews} width={1600} height={900} defaultProps={REWARD_DEFAULTS} />
      <Still id="HKBoardingPass" component={HKBoardingPass} width={1600} height={900} />
      <Still id="HKForecast" component={HKForecast} width={1600} height={900} />
      <Still id="HKCycleFeature" component={HKCycleFeature} width={1600} height={900} />
      <Still id="HKBulletin" component={HKBulletin} width={1600} height={900} defaultProps={BULLETIN_DEFAULTS} />
      <Still id="HKJobAd" component={HKJobAd} width={1600} height={900} />
      <Still id="HKBoldChoice" component={HKBoldChoice} width={1600} height={900} />
      <Still id="HKNowLive" component={HKNowLive} width={1600} height={900} defaultProps={HK_NOW_DEFAULTS} />
      <Still id="HKNowZones" component={HKNowZones} width={1600} height={900} defaultProps={HK_NOW_DEFAULTS} />
      <Still id="HKNowLevel" component={HKNowLevel} width={1600} height={900} defaultProps={HK_NOW_DEFAULTS} />
      <Still id="HKNowOut" component={HKNowOut} width={1600} height={900} defaultProps={HK_NOW_DEFAULTS} />
      <Still id="HKLogo" component={HKLogo} width={1080} height={1080} />
      <Still id="HKBanner" component={HKBanner} width={1500} height={500} />
      <Still id="HKPostEmpty" component={HKPostEmpty} width={1600} height={900} />
      <Still id="HKPostWho" component={HKPostWho} width={1600} height={900} />
      <Still id="HKPostBoard" component={HKPostBoard} width={1600} height={900} />
      <Still id="HKPostRules" component={HKPostRules} width={1600} height={900} />
      <Still id="HKHookPaper" component={HKHookPaper} width={1600} height={900} />
      <Still id="HKHookCore" component={HKHookCore} width={1600} height={900} />
      <Still id="HKHookTen" component={HKHookTen} width={1600} height={900} />
      <Composition id="HKGif" component={HKGif} width={720} height={720} fps={30} durationInFrames={HK_GIF_LENGTH} />
      <Composition id="HKNews" component={HKNews} width={1920} height={1080} fps={30} durationInFrames={HK_NEWS_LENGTH} defaultProps={HK_NEWS_DEFAULTS} />
      <Composition id="HKExplainer" component={HKExplainer} width={1920} height={1080} fps={30} durationInFrames={HK_EXPLAINER_LENGTH} />
      <Composition id="HKTutorial" component={HKTutorial} width={1920} height={1080} fps={30} durationInFrames={HK_TUTORIAL_LENGTH} />
      <Composition id="HKSimulation" component={HKSimulation} width={1920} height={1080} fps={30} durationInFrames={HK_SIM_LENGTH} />
      <Still id="HZNowOpen" component={HZNowOpen} width={1600} height={900} />
      <Still id="HZNowCharge" component={HZNowCharge} width={1600} height={900} />
      <Still id="HZNowOut" component={HZNowOut} width={1600} height={900} />
      <Still id="HZLogo" component={HZLogo} width={1080} height={1080} />
      <Still id="HZBanner" component={HZBanner} width={1500} height={500} />
      <Still id="HZPostOrbit" component={HZPostOrbit} width={1600} height={900} />
      <Still id="HZPostLaws" component={HZPostLaws} width={1600} height={900} />
      <Still id="HZPostEmpty" component={HZPostEmpty} width={1600} height={900} />
      <Still id="HZPostWho" component={HZPostWho} width={1600} height={900} />
      <Still id="HZHookPaper" component={HZHookPaper} width={1600} height={900} />
      <Still id="HZHookOutmass" component={HZHookOutmass} width={1600} height={900} />
      <Still id="HZHookTen" component={HZHookTen} width={1600} height={900} />
      <Composition id="HZGif" component={HZGif} width={720} height={720} fps={30} durationInFrames={HZ_GIF_LENGTH} />
      <Composition id="HZExplainer" component={HZExplainer} width={1920} height={1080} fps={30} durationInFrames={HZ_EXPLAINER_LENGTH} />
      <Composition id="HZTutorial" component={HZTutorial} width={1920} height={1080} fps={30} durationInFrames={HZ_TUTORIAL_LENGTH} />
      <Composition id="HZSimulation" component={HZSimulation} width={1920} height={1080} fps={30} durationInFrames={HZ_SIM_LENGTH} />
      <Still id="KPLogoPad" component={KPLogoPad} width={1080} height={1080} />
      <Still id="KPLogo" component={KPLogo} width={1080} height={1080} />
      <Still id="KPBanner" component={KPBanner} width={1500} height={500} />
      <Still id="KPPostLadder" component={KPPostLadder} width={1600} height={900} />
      <Still id="KPPostEmpty" component={KPPostEmpty} width={1600} height={900} />
      <Still id="KPPostWho" component={KPPostWho} width={1600} height={900} />
      <Still id="KPHookPaper" component={KPHookPaper} width={1600} height={900} />
      <Still id="KPHookOuthold" component={KPHookOuthold} width={1600} height={900} />
      <Still id="KPHookTen" component={KPHookTen} width={1600} height={900} />
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
