# GPT Image 2 · 苏晚服务门惊悚连续镜头

Mode B host-native image edit/generation using the existing approved runtime frames as visual references.

```json
{
  "type": "six-shot cinematic horror storyboard contact sheet",
  "goal": "create six separable production stills for a browser interactive-film sequence, each panel a usable image asset",
  "subject": {
    "primary": "Su Wan, the same original Chinese woman in her early thirties from the supplied references: short black bob with blunt bangs, small beauty mark below her left eye, pale ivory sleeveless wedding qipao, holding one matte black unmarked access card",
    "secondary": "first-person viewpoint of Lu Ye's shoulder-mounted wedding camera behind wired safety glass",
    "mood": "quiet recognition escalating into temporal dread, one sharp but elegant jump scare, then uncanny absence",
    "style": "the exact approved Camera Nine visual language: premium live-action feature-film still interpreted through restrained semi-realistic cel shading, wet celluloid noir, deep petrol green and blue-black shadows, small tungsten practicals, one restrained red access light, subtle 35mm grain, realistic Chinese hotel service architecture",
    "aspect_ratio_per_panel": "16:9 cinematic composition inside every cell"
  },
  "layout": {
    "grid": { "rows": 2, "columns": 3, "count": 6 },
    "sheet_aspect_ratio": "3:2 contact sheet",
    "panel_borders": "thin neutral black gutters with perfectly aligned equal cells, no captions or numbers",
    "sections": [
      { "position": "row 1 col 1", "description": "wide first-person corridor shot: Su Wan stands alone at the far wired-glass service door, rain-blue darkness, tiny red access lamp, she has just noticed the camera" },
      { "position": "row 1 col 2", "description": "medium shot through wet wired glass: Su Wan walks closer and raises the same matte black access card, her expression urgent but controlled" },
      { "position": "row 1 col 3", "description": "tight shot: Su Wan presses her left palm and black card against the glass; her real face looks toward the camera but her reflection in a narrow metal panel looks sideways, a subtle impossible one-beat delay" },
      { "position": "row 2 col 1", "description": "near-black frame after power failure: only the red access lamp, a pale hand silhouette and condensation trails remain visible behind the glass" },
      { "position": "row 2 col 2", "description": "controlled jump-scare extreme close-up: Su Wan's recognizable human face suddenly fills the wired glass inches from the lens, one eye sharply aligned with the viewer, palm flattened beside her cheek, no monster anatomy, no gore, the terror comes from impossible proximity and direct recognition" },
      { "position": "row 2 col 3", "description": "aftermath wide shot of the now empty corridor and closed service door; black card lies on the near side of the glass beside one child-sized wet footprint and a short strip of white wedding ribbon, red lamp still lit" }
    ],
    "continuity": "all six panels are consecutive moments in one location; identical Su Wan face, bob haircut, beauty mark, wedding dress, card dimensions, door, wired-glass pattern, camera height, color grade and weather; spatial positions progress logically"
  },
  "lighting": {
    "primary": "dim cold rain bounce from corridor windows",
    "secondary": "weak tungsten spill behind Su Wan",
    "accents": "one small rectangular red access-control lamp reflected in water and glass"
  },
  "constraints": {
    "must_keep": [
      "exactly six equal readable panels in row-major order",
      "same adult woman in every panel where she appears",
      "no text, no captions, no panel numbers, no UI",
      "jump scare remains psychologically uncanny, not grotesque",
      "every panel works when cropped independently",
      "match the supplied approved frames rather than inventing a new art style"
    ],
    "avoid": [
      "gore, wounds, zombie eyes, demonic face, screaming mouth",
      "western hotel architecture, cyberpunk neon, generic anime glamour",
      "extra people, duplicate bodies, inconsistent dress or haircut",
      "comic speech bubbles, storyboard sketches, visible camera HUD",
      "random unrelated scenes or changing locations"
    ]
  }
}
```
