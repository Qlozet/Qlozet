// One set of names and "where the tape goes" notes for every measurement a
// customer can record, so an order and the Customers page read the same.
// The definitions match the shop's (app/profile/types.ts MEASUREMENT_HINTS)
// and the AI estimate's (BodyM / ANSUR), so a typed value and an estimated
// one mean the same thing. Keep in step with the shop when either changes.

export const MEASUREMENT_LABELS: Record<string, string> = {
  neck: 'Neck',
  neck_circumference: 'Neck',
  neck_base: 'Neck Base',
  shoulder: 'Shoulder Width',
  shoulder_breadth: 'Shoulder Breadth (bone to bone)',
  shoulder_width: 'Shoulder Width (seam to seam)',
  across_back: 'Across Back',
  chest: 'Chest / Bust',
  bust: 'Bust',
  under_bust: 'Under Bust',
  waist: 'Waist',
  belly_waist: 'Belly Waist',
  top_hip: 'High Hip',
  hip: 'Hips',
  hips: 'Hips',
  arm_length: 'Arm Length',
  sleeve_length: 'Sleeve Length',
  upper_arm: 'Upper Arm',
  bicep: 'Bicep',
  elbow: 'Elbow',
  forearm: 'Forearm',
  wrist: 'Wrist',
  height: 'Height',
  weight: 'Weight',
  shoulder_to_crotch: 'Torso Length',
  nape_to_waist: 'Back Length (Nape to Waist)',
  back_length: 'Back Length',
  front_length: 'Front Length',
  leg_length: 'Leg Length',
  inseam: 'Inseam',
  inseam_length: 'Inseam',
  outseam: 'Outseam',
  outseam_length: 'Outseam',
  crotch_depth: 'Crotch Depth',
  hip_to_knee: 'Hip to Knee',
  knee_to_ankle: 'Knee to Ankle',
  waist_height: 'Waist Height (Floor to Waist)',
  neck_height: 'Neck Height (Floor to Nape)',
  ankle_height: 'Ankle Height',
  thigh: 'Thigh',
  mid_thigh: 'Mid Thigh',
  lower_thigh: 'Lower Thigh (Above Knee)',
  knee: 'Knee',
  calf: 'Calf',
  ankle: 'Ankle',
};

/** Where the tape goes. Shown on hover, and on the printed sheet. */
export const MEASUREMENT_DEFINITIONS: Record<string, string> = {
  chest: 'Around the fullest part of the chest, tape level.',
  bust: 'Around the fullest part of the bust, tape level.',
  under_bust:
    'Around the ribcage just under the bust. Estimated as chest minus 9 cm when predicted.',
  waist: 'Around the natural waist, just above the navel.',
  belly_waist: 'Around the fullest part of the belly.',
  top_hip: 'Around the high hip, just below the waist.',
  hip: 'Around the fullest part of the hips and seat.',
  hips: 'Around the fullest part of the hips and seat.',
  neck: 'Around the middle of the neck.',
  neck_base: 'Around the base of the neck, where a collar sits.',
  shoulder_breadth:
    'Straight line between the two shoulder bones, across the back. A shoulder seam usually runs a few centimetres more.',
  shoulder_width:
    'Seam to seam across the back. Estimated as the bone-to-bone breadth plus 3.5 cm; measure the customer before cutting.',
  across_back: 'Across the back between the two back armpit folds, arms down.',
  arm_length: 'Shoulder bone to wrist bone, arm relaxed at the side.',
  sleeve_length: 'Centre back of the neck, over the shoulder, to the wrist.',
  bicep: 'Around the fullest part of the upper arm, arm relaxed.',
  upper_arm: 'Around the fullest part of the upper arm, arm relaxed.',
  forearm: 'Around the fullest part of the forearm.',
  wrist: 'Around the wrist bone.',
  height: 'Standing straight against a wall, without shoes.',
  shoulder_to_crotch: 'Top of the shoulder, down the front, to the crotch.',
  nape_to_waist: 'Nape of the neck down the back to the waist.',
  leg_length: 'From the crotch straight down to the floor.',
  inseam: 'Crotch to the ankle bone, along the inside of the leg.',
  outseam: 'Waist to the ankle bone, along the outside of the leg.',
  waist_height: 'Floor to the natural waist.',
  neck_height: 'Floor to the nape of the neck.',
  ankle_height: 'Floor to the ankle bone.',
  thigh: 'Around the fullest part of the thigh, just below the crotch.',
  mid_thigh: 'Around the thigh, halfway between crotch and knee.',
  lower_thigh: 'Around the thigh, just above the knee.',
  knee: 'Around the knee.',
  calf: 'Around the fullest part of the calf.',
  ankle: 'Around the ankle bone.',
};

export const measurementLabel = (key: string): string =>
  MEASUREMENT_LABELS[key] ??
  key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** How a set was taken, in words a tailor can act on. */
export const MEASUREMENT_METHOD: Record<
  string,
  { label: string; tone: 'good' | 'warn' | 'neutral'; hint: string }
> = {
  manual: {
    label: 'Measured by the customer',
    tone: 'good',
    hint: 'The customer entered these themselves, from a tape measure.',
  },
  estimate: {
    label: 'Estimated from height & weight',
    tone: 'warn',
    hint: 'Predicted by Qlozet from height, weight and build, not measured. Check the key ones with the customer before cutting.',
  },
  mixed: {
    label: 'Estimate, partly corrected',
    tone: 'warn',
    hint: 'Started as an estimate from height and weight; the customer corrected some values by hand.',
  },
  scan: {
    label: 'From a body scan',
    tone: 'neutral',
    hint: 'Measured from the customer’s photos.',
  },
};

export const FIT_PREFERENCE_LABEL = (fit: string): string =>
  fit.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
