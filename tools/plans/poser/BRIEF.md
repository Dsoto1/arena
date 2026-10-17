# His brief: 3D character poser + equipment rendering overhaul (2026-10-17, verbatim; his message ended mid-§9)

FLAVIUS RULE — 3D CHARACTER POSER & EQUIPMENT RENDERING OVERHAUL

ROLE
Act as a senior AAA character artist, anatomical sculptor, character technical artist, combat animation director, PBR materials specialist, 3D rendering engineer, and software QA engineer.
You are upgrading the existing 3D human avatar poser used by Flavius Rule, a Roman gladiatorial strategy game.
This is a production implementation task. Inspect the existing project, understand its architecture, identify the most valuable improvements, implement them, and validate the actual results.
The goal is to transform the current tool into a polished, professional character presentation system with convincing human anatomy, expressive faces, authentic gladiatorial poses, well-fitted equipment, and high-quality rendering.
Do not rebuild the application from scratch or replace working systems without a clear technical justification.

1. UNDERSTAND THE EXISTING PIPELINE
Before changing anything, trace the entire character-generation and rendering pipeline.
Understand how the system:
1. Receives a user-generated or system-generated character portrait.
2. Extracts or receives character identity, appearance, and other relevant information.
3. Constructs or selects the 3D human body.
4. Positions the head, torso, limbs, hands, and feet.
5. Applies character poses and articulation.
6. Attaches armor, clothing, shields, and weapons.
7. Applies materials, textures, lighting, and shadows.
8. Produces the final character render.
Identify the existing 3D engine, geometry generation methods, skeletal structure, procedural posing logic, equipment attachment points, material system, and camera configuration.
Determine which characteristics are inherited from the portrait and which are generated procedurally.
Inspect the current results before modifying the implementation. Establish a baseline using representative characters and equipment combinations.
Do not assume that the project uses a particular 3D framework, rigging system, or rendering technique until the source code confirms it.

2. HUMAN ANATOMY AND BODY QUALITY
The human figure is the foundation of the entire system. Improve its proportions, silhouette, anatomy, and surface definition while retaining compatibility with existing posing and equipment systems.
A. Overall proportions
Create a believable adult human figure with coherent anatomical proportions.
Improve:
* Head-to-body ratio.
* Shoulder width and torso proportions.
* Rib cage and pelvis definition.
* Waist transitions.
* Upper and lower arm proportions.
* Thigh and calf proportions.
* Elbow, knee, wrist, ankle, and other joint landmarks.
* Hand and foot proportions.
* Neck, trapezius, and shoulder transitions.
Avoid exaggerated superhero anatomy, oversized heads, unnaturally narrow waists, excessively broad shoulders, or inconsistent limb lengths unless a specific character design calls for them.
Support meaningful variation in physique, including lean, athletic, muscular, stocky, and heavier body types where the existing system permits it.
Variation should affect the actual underlying anatomy and silhouette, not simply scale the entire character uniformly.
B. Musculature
Develop a convincing anatomical structure appropriate for trained gladiators and ordinary human characters.
Prioritize recognizable muscle groups:
* Pectorals and sternum region.
* Deltoids and trapezius.
* Biceps, triceps, and forearms.
* Latissimus dorsi and upper back.
* Abdominal muscles and obliques.
* Gluteal muscles.
* Quadriceps and hamstrings.
* Calves and supporting lower-leg structures.
Muscle definition should come primarily from coherent geometry, silhouette, and lighting rather than painted-on lines or dark outlines.
Ensure muscles transition naturally into adjacent muscle groups and joints.
Avoid the appearance of separate inflated spheres joined together. Eliminate obvious gaps, intersecting surfaces, abrupt transitions, and unnatural bulges.
Muscle definition should respond to the selected body type. A lean fighter should not have the same mass and surface contours as a heavyweight gladiator.
C. Hands and feet
Hands and feet are particularly important for equipment-driven character renders.
Improve:
* Finger separation and proportions.
* Thumb placement and opposition.
* Wrist transitions.
* Palm shape.
* Grip orientation.
* Foot arches and toe direction where visible.
* Natural contact between feet and the ground.
Weapons must be held by the hands rather than floating nearby or intersecting the palm.
If a weapon uses a predefined grip, ensure the hand orientation, wrist rotation, and weapon attachment work together.
Where a fully articulated hand is unavailable, prioritize a convincing silhouette and functional grip over excessive geometric complexity.
D. Skin and surface quality
Improve the visual definition of the body without introducing an unnecessarily expensive skin simulation system.
Use appropriate geometry, smooth normals, controlled roughness, subtle color variation, and suitable shading.
Avoid:
* Plastic-looking skin.
* Excessively shiny bodies.
* Harsh black muscle outlines.
* Faceted joints.
* Unintentional surface seams.
* Overly smooth anatomy resembling a featureless mannequin.
Maintain a coherent stylized-realistic presentation compatible with the established Flavius Rule art direction.

3. FACE AND HEAD QUALITY
The face is central to character identity and should receive dedicated attention.
Inspect how the head is currently constructed and choose an improvement strategy compatible with the existing portrait-to-model pipeline.
Prioritize:
* Recognizable cranial shape.
* Forehead and brow ridge.
* Eye sockets and eyelids.
* Eye spacing and orientation.
* Nose bridge, tip, and nostrils.
* Cheekbones.
* Jawline and chin.
* Lips and mouth structure.
* Ears.
* Neck attachment.
* Hair, facial hair, and other supported appearance features.
Avoid generic featureless heads, protruding spherical eyes, oversized noses, excessively sharp facial planes, and visibly disconnected facial components.
Facial details should be integrated into the underlying head geometry or generated using a coherent technique that suits the renderer.
Preserve portrait identity
The supplied portrait is the source of character identity.
Preserve relevant characteristics that the current pipeline supports, including:
* Face shape.
* Skin tone.
* Hair color and style.
* Facial hair.
* Age cues.
* Distinctive facial proportions.
* Other identifiable visual features.
Do not force every character into the same face template.
If the system derives structured attributes from the portrait, improve the mapping from those attributes to the 3D model.
If the system does not reliably extract facial geometry from a 2D image, do not pretend that the original face can be reproduced exactly. Improve the available parameterization and document the limitations.

4. POSING SYSTEM — AUTHENTIC GLADIATORS
This is a critical priority.
The existing poser should produce characters who look like trained fighters rather than generic mannequins, action figures, or people standing in a default A-pose.
Develop a coherent collection of reusable, anatomically sound poses appropriate for a Roman gladiatorial game.
A. Fundamental posing principles
Every pose should account for:
* Center of gravity.
* Weight distribution.
* Foot placement.
* Balance and counterbalance.
* Pelvis orientation.
* Torso rotation.
* Shoulder alignment.
* Head direction.
* Elbow and wrist orientation.
* Natural joint limits.
* Weapon weight and leverage.
* Clear separation between the character and equipment.
Avoid locked knees, straight horizontal arms, mirrored limbs, unnaturally twisted wrists, collapsed shoulders, excessive spinal curvature, and joints bending in the wrong direction.
A fighter holding a heavy shield should compensate for its weight. A fighter thrusting a weapon should use an appropriate stance and body alignment. A fighter recovering from an attack should look different from one preparing to strike.
B. Pose library
Audit existing poses before adding new ones.
Where appropriate, provide reusable pose categories such as:
1. Neutral character presentation.
2. Athletic ready stance.
3. Defensive guard.
4. Sword-and-shield guard.
5. Spear or thrusting-weapon stance.
6. Two-handed weapon stance.
7. Overhead attack preparation.
8. Forward thrust or lunge.
9. Wide slashing attack.
10. Evasive or dodging stance.
11. Recovering or staggered stance.
12. Wounded or exhausted stance.
13. Victory presentation.
14. Defeated or kneeling pose.
These are reference categories, not a requirement to add redundant controls or disrupt the existing interface.
Each pose must work with the relevant equipment and remain visually understandable from the intended camera angle.
C. Combat-specific body mechanics
Use believable combat principles as artistic guidance rather than attempting to simulate a complete martial arts engine.
For example:
* A thrust should involve coordinated arm extension, torso alignment, and weight transfer.
* A slash should show a plausible relationship between shoulder rotation, elbow position, weapon trajectory, and stance.
* A shield defense should place the shield between the fighter and the expected threat.
* A lunge should show meaningful weight transfer and appropriate foot placement.
* A heavy weapon should require a convincing supporting posture.
* A defensive fighter should protect vulnerable areas without hiding the entire character.
Avoid poses that look impressive from one angle but become anatomically incoherent when viewed from another.
D. Procedural pose quality
If the current system generates poses procedurally, improve the existing pose-generation logic rather than introducing an unrelated animation system.
Use named pose definitions, reusable pose parameters, anatomical constraints, and deterministic generation where appropriate.
Random variation should be constrained by the selected pose and equipment.
Do not independently randomize every joint. Randomness must not destroy balance, weapon grip, or anatomical plausibility.
If inverse kinematics is already available or can be added economically, consider using it for hands, feet, and weapon contacts. Do not introduce a complex solver if a simpler existing approach can produce reliable results.

5. ARMOR AND CLOTHING RENDERING
Armor must appear to belong to the character, rather than being a collection of unrelated objects placed around a body.
Audit the equipment attachment system and improve fit, orientation, scale, overlap, and material presentation.
A. Equipment fit
Prioritize:
* Helmet alignment with the head.
* Chest armor fitting the torso.
* Shoulder guards following shoulder orientation.
* Bracers following the forearms.
* Greaves following the lower legs.
* Belts and waist armor aligning with the pelvis.
* Shields following the intended arm or hand.
* Weapons following their grip and attachment points.
Reduce visible gaps, floating equipment, excessive intersections, and clipping through the body.
Preserve appropriate clearance at joints. Armor should not intersect deeply with the body when a character assumes a combat stance.
B. Equipment-aware posing
A pose should account for the equipped armor and weapons.
Examples:
* A large shield should influence arm position and torso presentation.
* A heavy two-handed weapon should use an appropriate grip and stance.
* A helmet should not visibly detach or rotate incorrectly when the head changes orientation.
* Shoulder armor should follow the shoulder without clipping excessively into the neck.
* Greaves and boots should remain aligned with the legs and feet.
Do not create a separate incompatible pose system for every equipment combination. Prefer reusable poses with equipment-specific adjustments.
C. Armor detail
Improve the perceived craftsmanship of existing armor assets.
Where appropriate, refine:
* Plate thickness.
* Beveled edges.
* Overlapping plates.
* Rivets and fasteners.
* Leather straps.
* Buckles.
* Seams and panel boundaries.
* Helmet openings.
* Shield rims and bosses.
* Weapon guards and pommels.
Prioritize details that remain visible at the final render resolution.
Do not add hundreds of tiny decorative details that disappear in the final image or significantly increase rendering costs.
Do not redesign the equipment catalog or change gameplay properties simply to improve appearance.

6. WEAPON QUALITY AND HANDLING
Weapons should have coherent geometry, proportions, and attachment behavior.
Audit each supported weapon type and its rendering method.
Where appropriate, improve:
* Blade shape and thickness.
* Spear shafts and tips.
* Sword guards and pommels.
* Handle proportions.
* Shield silhouettes.
* Surface materials.
* Edge definition.
* Reflections and highlights.
* Weapon orientation relative to the character.
Ensure the hand grips the actual handle at a believable location.
Prevent visible gaps between the hand and grip, weapons passing through the palm, and weapon geometry intersecting the forearm.
Maintain each weapon's recognizable identity and existing gameplay functionality.
If the game generates weapons procedurally, improve the underlying geometry parameters instead of adding arbitrary decorative geometry to individual examples.

7. MATERIALS AND CHARACTER LIGHTING
Upgrade the rendering quality so anatomy, armor, faces, and weapons have convincing volume and surface definition.
Lighting
* Establish a consistent key light, fill light, and subtle rim light where appropriate.
* Use soft directional lighting to reveal muscle groups and facial structure.
* Improve contact shadows around the feet, under the chin, between overlapping armor plates, and where equipment meets the body.
* Use ambient occlusion or a suitable approximation when supported.
* Preserve readable detail in dark materials.
* Avoid excessively bright highlights that erase surface detail.
Materials
Distinguish materials through physically plausible or visually convincing roughness and reflectance.
* Skin should not look like polished plastic.
* Leather should have a subdued, textured appearance.
* Cloth should read differently from metal.
* Bronze, iron, and steel should have distinguishable surface characteristics.
* Polished metal should use controlled highlights rather than large white patches.
* Wood and shield surfaces should have appropriate grain or tonal variation where visible.
Use the renderer's existing material system where possible.
Avoid expensive shader complexity, excessive texture resolution, and elaborate post-processing unless the actual output demonstrates a worthwhile improvement.

8. CHARACTER COMPOSITION AND PRESENTATION
Improve the final render as a complete character portrait, not merely a better model.
* Establish a consistent camera and framing convention.
* Keep the full character and relevant equipment within the frame.
* Preserve clear silhouettes around weapons and shields.
* Avoid cropping hands, feet, helmet crests, or weapon tips unintentionally.
* Use camera angles that communicate the pose and equipment effectively.
* Prevent weapons from obscuring the face unnecessarily.
* Keep lighting and background contrast appropriate for the character's colors.
If the tool supports multiple viewing angles, ensure the model remains convincing beyond the primary presentation angle.
Preserve existing output dimensions, transparency requirements, export formats, and downstream integrations.

9. ENGINEERING AND PERFORMANCE
Maintain the current application architecture unless inspection establishes
[message ended here]
