import { ArtworkSceneId } from '../utils/gouacheArtGenerator';

export type WorkCategory = 'Films' | 'Clips' | 'Brand films';

export interface StudioWork {
  id: string;
  indexLabel: string;
  title: string;
  category: WorkCategory;
  typeLabel: string;
  duration: string;
  year: string;
  director: string;
  paintBeds: string;
  frameRate: string;
  synopsis: string;
  layerNotes: {
    sketch: string;
    layout: string;
    gouache: string;
    composite: string;
  };
  primarySceneId: ArtworkSceneId;
  secondarySceneId: ArtworkSceneId;
  heroCard: string;
  secondaryCard: string;
  scenePreview: string;
  videoStart: number;
  videoEnd: number;
  palette: [string, string, string, string];
}

export interface ScrollyChapter {
  id: string;
  sceneId: ArtworkSceneId;
  secondarySceneId?: ArtworkSceneId;
  sceneCode: string;
  timecode: string;
  locationLabel: string;
  scrollStart: number;
  scrollEnd: number;
  videoTimeStart: number;
  videoTimeEnd: number;
  fallbackFrame: string;
  headlineLines: string[];
  alignment: 'bottom-left' | 'center' | 'split-bottom';
  sideNote?: string;
  showTicker?: boolean;
  showStamp?: boolean;
}

export const DEMO_VIDEO_PATH = '/assets/aistudio/20261027-0745-58.6910660_68be558f.mp4';

export const SCROLLY_CHAPTERS: ScrollyChapter[] = [
  {
    id: 'chapter-clouds',
    sceneId: 'clouds_opening',
    sceneCode: 'SC 01',
    timecode: '00:06:37',
    locationLabel: 'ABOVE THE CITY',
    scrollStart: 0.0,
    scrollEnd: 0.18,
    videoTimeStart: 1.22,
    videoTimeEnd: 1.95,
    fallbackFrame: '/assets/generated/gen_scene_01_clouds.jpg',
    headlineLines: ['We paint the city', 'one frame at a time.'],
    alignment: 'bottom-left',
    showTicker: true,
  },
  {
    id: 'chapter-avenue',
    sceneId: 'autumn_avenue',
    sceneCode: 'SC 01',
    timecode: '00:06:39',
    locationLabel: 'ABOVE THE CITY',
    scrollStart: 0.18,
    scrollEnd: 0.38,
    videoTimeStart: 1.95,
    videoTimeEnd: 3.35,
    fallbackFrame: '/assets/generated/gen_scene_02_avenue.jpg',
    headlineLines: ['Small team.', 'Slow pencils.', 'Big skies.'],
    alignment: 'bottom-left',
  },
  {
    id: 'chapter-stories',
    sceneId: 'girl_looking_up',
    sceneCode: 'SC 01',
    timecode: '00:06:43',
    locationLabel: 'ABOVE THE CITY',
    scrollStart: 0.38,
    scrollEnd: 0.56,
    videoTimeStart: 3.35,
    videoTimeEnd: 4.75,
    fallbackFrame: '/assets/generated/gen_scene_03_girl.jpg',
    headlineLines: ['Films, clips', 'and brand stories'],
    alignment: 'bottom-left',
  },
  {
    id: 'chapter-lookup',
    sceneId: 'facade_clouds',
    sceneCode: 'SC 01',
    timecode: '00:06:45',
    locationLabel: 'ABOVE THE CITY',
    scrollStart: 0.56,
    scrollEnd: 0.74,
    videoTimeStart: 4.75,
    videoTimeEnd: 5.75,
    fallbackFrame: '/assets/generated/gen_scene_04_lookup.jpg',
    headlineLines: ['When did you', 'last look up?'],
    alignment: 'center',
  },
  {
    id: 'chapter-studio',
    sceneId: 'window_artist',
    secondarySceneId: 'skyline_canopy',
    sceneCode: 'SC 01',
    timecode: '00:06:49',
    locationLabel: 'ABOVE THE CITY',
    scrollStart: 0.74,
    scrollEnd: 1.0,
    videoTimeStart: 5.75,
    videoTimeEnd: 7.65,
    fallbackFrame: '/assets/generated/gen_scene_06_skyline.jpg',
    headlineLines: ['Sketch, layout,', 'paint, motion.'],
    alignment: 'split-bottom',
    sideNote:
      'Sketches go up on one wall. Every layer is painted by hand and moves at its own pace.',
    showStamp: true,
  },
];

export const STUDIO_WORKS: StudioWork[] = [
  {
    id: 'upstairs',
    indexLabel: '01 / 06',
    title: 'Upstairs',
    category: 'Films',
    typeLabel: 'Short film',
    duration: '7:40',
    year: '2025',
    director: 'Haruka Sato & Kenji Mori',
    paintBeds: '4 Gouache Multiplane Beds',
    frameRate: '24 FPS on 2s & 3s',
    synopsis:
      'From a fourth-floor timber window, an animator watches afternoon clouds drift across concrete towers while maple leaves trace the wind currents between rooftops.',
    layerNotes: {
      sketch: '6B graphite layout on 240gsm cotton animation paper with pegbar registration.',
      layout: 'Three-point vertical perspective grid separating interior desk shadow from sky.',
      gouache: 'Poster color and mineral gouache washes for warm afternoon terracotta and cobalt sky.',
      composite: 'Multiplane camera pass with sheer curtain translucency and hand-timed leaf drift.',
    },
    primarySceneId: 'window_curtain',
    secondarySceneId: 'window_artist',
    heroCard: '/assets/generated/gen_scene_05_studio_card1.jpg',
    secondaryCard: '/assets/generated/gen_scene_05_studio_card2.jpg',
    scenePreview: '/assets/generated/gen_scene_05_studio.jpg',
    videoStart: 5.8,
    videoEnd: 7.6,
    palette: ['#D96B27', '#587498', '#E8DFCA', '#2D2722'],
  },
  {
    id: 'paper-weather',
    indexLabel: '02 / 06',
    title: 'Paper Weather',
    category: 'Films',
    typeLabel: 'Short film',
    duration: '6:15',
    year: '2025',
    director: 'Aoi Takahashi',
    paintBeds: '5 Cloud Cel & Paper Beds',
    frameRate: '24 FPS Hand-Brushed',
    synopsis:
      'A study of cumulus formations breaking over the eastern district—each cloud bank painted on wet-on-dry archival paper and stepped frame by frame.',
    layerNotes: {
      sketch: 'Loose charcoal cloud volume studies capturing boiling cumulus edges.',
      layout: 'Wide-angle horizon lock at 15% frame height to emphasize towering sky depth.',
      gouache: 'Titanium white impasto over cerulean, ultramarine ash, and warm ochre underpainting.',
      composite: 'Optical diffusion pass with natural paper tooth grain preserved at 4K.',
    },
    primarySceneId: 'clouds_opening',
    secondarySceneId: 'clouds_horizon',
    heroCard: '/assets/generated/gen_scene_01_clouds_card1.jpg',
    secondaryCard: '/assets/generated/gen_scene_01_clouds_card2.jpg',
    scenePreview: '/assets/generated/gen_scene_01_clouds.jpg',
    videoStart: 1.22,
    videoEnd: 2.35,
    palette: ['#6782A8', '#EEF1F6', '#94A3B8', '#1E293B'],
  },
  {
    id: 'last-tram',
    indexLabel: '03 / 06',
    title: 'Last Tram',
    category: 'Films',
    typeLabel: 'Short film',
    duration: '9:10',
    year: '2024',
    director: 'Renjiro Kurosawa',
    paintBeds: '4 Paint Beds · Gouache',
    frameRate: '24 FPS',
    synopsis:
      'Golden hour stretches down a six-lane avenue lined with ginkgo and maple trees as commuters pause to watch the sky turn amber between glass facades.',
    layerNotes: {
      sketch: 'Architectural vanishing-point pencil draft with hand-drawn vehicle silhouettes.',
      layout: 'Separated foreground canopy, mid-ground avenue traffic, and distant haze towers.',
      gouache: 'Cadmium orange, burnt sienna, and prussian blue shadow glazes on toned paper.',
      composite: 'Subtle camera crane descent from cloud deck to street level over 140 frames.',
    },
    primarySceneId: 'autumn_avenue',
    secondarySceneId: 'tram_crossing',
    heroCard: '/assets/generated/gen_scene_02_avenue_card1.jpg',
    secondaryCard: '/assets/generated/gen_scene_02_avenue_card2.jpg',
    scenePreview: '/assets/generated/gen_scene_02_avenue.jpg',
    videoStart: 1.95,
    videoEnd: 3.45,
    palette: ['#D95D24', '#3B526E', '#F2B857', '#232B38'],
  },
  {
    id: 'red-canopy',
    indexLabel: '04 / 06',
    title: 'Red Canopy',
    category: 'Clips',
    typeLabel: 'Music film',
    duration: '3:52',
    year: '2025',
    director: 'Haruka Sato',
    paintBeds: '3 Cel + 2 Gouache Beds',
    frameRate: '24 FPS on 1s & 2s',
    synopsis:
      'An intimate street-level portrait following a student walking home beneath blazing autumn maples as late sunlight reflects off brick apartment blocks.',
    layerNotes: {
      sketch: 'Expressive rough key animation for hair and sailor collar movement in the wind.',
      layout: 'Low-angle 28mm lens simulation looking up past warm terracotta balconies.',
      gouache: 'Layered vermilion and ochre foliage dabbed with natural bristle brushes.',
      composite: 'Warm halation glow along rim-lit hair strands and drifting foreground leaves.',
    },
    primarySceneId: 'girl_looking_up',
    secondarySceneId: 'terracotta_tower',
    heroCard: '/assets/generated/gen_scene_03_girl_card1.jpg',
    secondaryCard: '/assets/generated/gen_scene_03_girl_card2.jpg',
    scenePreview: '/assets/generated/gen_scene_03_girl.jpg',
    videoStart: 3.45,
    videoEnd: 4.85,
    palette: ['#C84B28', '#E08A44', '#4A352D', '#F5E6D3'],
  },
  {
    id: 'quiet-facade',
    indexLabel: '05 / 06',
    title: 'Quiet Facade',
    category: 'Brand films',
    typeLabel: 'Brand film',
    duration: '2:15',
    year: '2025',
    director: 'Kenji Mori',
    paintBeds: '4 Paint Beds · Poster Color',
    frameRate: '24 FPS',
    synopsis:
      'Commissioned architectural monograph film where parting morning clouds reveal a limestone heritage building at the heart of the financial district.',
    layerNotes: {
      sketch: 'Measured elevation drawing with soft graphite window reflections.',
      layout: 'Two foreground cloud curtains parting on opposing horizontal tracks.',
      gouache: 'Warm limestone buff, muted sage casements, and cool atmospheric cloud washes.',
      composite: 'Cross-dissolve cloud reveal synchronized to solo piano score.',
    },
    primarySceneId: 'facade_clouds',
    secondarySceneId: 'clouds_opening',
    heroCard: '/assets/generated/gen_scene_04_lookup_card1.jpg',
    secondaryCard: '/assets/generated/gen_scene_04_lookup_card2.jpg',
    scenePreview: '/assets/generated/gen_scene_04_lookup.jpg',
    videoStart: 4.8,
    videoEnd: 5.85,
    palette: ['#C5A888', '#8FA2B8', '#EAE6DF', '#3A322C'],
  },
  {
    id: 'autumn-draft',
    indexLabel: '06 / 06',
    title: 'Autumn Draft',
    category: 'Brand films',
    typeLabel: 'Brand film',
    duration: '4:05',
    year: '2024',
    director: 'Aoi Takahashi',
    paintBeds: '4 Paint Beds · Gouache',
    frameRate: '24 FPS',
    synopsis:
      'A celebration of slow craftsmanship—tracing a single maple leaf as it leaps from an animator’s storyboard wall into a panoramic autumn skyline.',
    layerNotes: {
      sketch: 'Wall-mounted storyboard thumbnails transitioning into full-bleed layout.',
      layout: 'Continuous match-cut from interior studio window frame to open city horizon.',
      gouache: 'Rich goldenrod canopy sweeps contrasted against crisp cerulean sky.',
      composite: 'Hand-painted leaf rotation cycles composited across three depth planes.',
    },
    primarySceneId: 'skyline_canopy',
    secondarySceneId: 'skyline_east',
    heroCard: '/assets/generated/gen_scene_06_skyline_card1.jpg',
    secondaryCard: '/assets/generated/gen_scene_06_skyline_card2.jpg',
    scenePreview: '/assets/generated/gen_scene_06_skyline.jpg',
    videoStart: 6.45,
    videoEnd: 7.75,
    palette: ['#E07A2E', '#4F7CAC', '#F0B64C', '#24303F'],
  },
];

export interface RingCardSlot {
  slotIndex: number;
  workIndex: number;
  sceneId: ArtworkSceneId;
  imageUrl: string;
  title: string;
  aspectClass: string;
}

export const TOP_RING_CARDS: RingCardSlot[] = [
  { slotIndex: 0, workIndex: 0, sceneId: 'window_curtain', imageUrl: '/assets/generated/gen_scene_05_studio_card1.jpg', title: 'Upstairs — Window', aspectClass: 'h-48 w-36' },
  { slotIndex: 1, workIndex: 1, sceneId: 'clouds_opening', imageUrl: '/assets/generated/gen_scene_01_clouds_card1.jpg', title: 'Paper Weather — Cumulus', aspectClass: 'h-44 w-34' },
  { slotIndex: 2, workIndex: 2, sceneId: 'autumn_avenue', imageUrl: '/assets/generated/gen_scene_02_avenue_card1.jpg', title: 'Last Tram — Avenue', aspectClass: 'h-48 w-36' },
  { slotIndex: 3, workIndex: 3, sceneId: 'girl_looking_up', imageUrl: '/assets/generated/gen_scene_03_girl_card1.jpg', title: 'Red Canopy — Dusk', aspectClass: 'h-46 w-36' },
  { slotIndex: 4, workIndex: 4, sceneId: 'facade_clouds', imageUrl: '/assets/generated/gen_scene_04_lookup_card1.jpg', title: 'Quiet Facade — Stone', aspectClass: 'h-44 w-34' },
  { slotIndex: 5, workIndex: 5, sceneId: 'skyline_canopy', imageUrl: '/assets/generated/gen_scene_06_skyline_card1.jpg', title: 'Autumn Draft — Canopy', aspectClass: 'h-48 w-36' },
  { slotIndex: 6, workIndex: 0, sceneId: 'window_artist', imageUrl: '/assets/generated/gen_scene_05_studio_card2.jpg', title: 'Upstairs — Desk', aspectClass: 'h-44 w-34' },
  { slotIndex: 7, workIndex: 1, sceneId: 'clouds_horizon', imageUrl: '/assets/generated/gen_scene_01_clouds_card2.jpg', title: 'Paper Weather — Drift', aspectClass: 'h-48 w-36' },
  { slotIndex: 8, workIndex: 2, sceneId: 'tram_crossing', imageUrl: '/assets/generated/gen_scene_02_avenue_card2.jpg', title: 'Last Tram — Golden Hour', aspectClass: 'h-46 w-34' },
  { slotIndex: 9, workIndex: 3, sceneId: 'terracotta_tower', imageUrl: '/assets/generated/gen_scene_03_girl_card2.jpg', title: 'Red Canopy — Tower', aspectClass: 'h-48 w-36' },
  { slotIndex: 10, workIndex: 4, sceneId: 'window_curtain', imageUrl: '/assets/generated/gen_scene_04_lookup_card2.jpg', title: 'Quiet Facade — Breeze', aspectClass: 'h-44 w-34' },
  { slotIndex: 11, workIndex: 5, sceneId: 'skyline_east', imageUrl: '/assets/generated/gen_scene_06_skyline_card2.jpg', title: 'Autumn Draft — Horizon', aspectClass: 'h-48 w-36' },
];

export const BOTTOM_RING_CARDS: RingCardSlot[] = [
  { slotIndex: 0, workIndex: 0, sceneId: 'skyline_canopy', imageUrl: '/assets/generated/gen_scene_06_skyline_card1.jpg', title: 'Upstairs — Skyline', aspectClass: 'h-48 w-36' },
  { slotIndex: 1, workIndex: 1, sceneId: 'clouds_horizon', imageUrl: '/assets/generated/gen_scene_01_clouds_card2.jpg', title: 'Paper Weather — Sky', aspectClass: 'h-44 w-34' },
  { slotIndex: 2, workIndex: 2, sceneId: 'tram_crossing', imageUrl: '/assets/generated/gen_scene_02_avenue_card2.jpg', title: 'Last Tram — Street', aspectClass: 'h-48 w-36' },
  { slotIndex: 3, workIndex: 3, sceneId: 'terracotta_tower', imageUrl: '/assets/generated/gen_scene_03_girl_card2.jpg', title: 'Last Tram — Brick', aspectClass: 'h-46 w-36' },
  { slotIndex: 4, workIndex: 4, sceneId: 'clouds_opening', imageUrl: '/assets/generated/gen_scene_01_clouds_card1.jpg', title: 'Quiet Facade — Mist', aspectClass: 'h-44 w-34' },
  { slotIndex: 5, workIndex: 5, sceneId: 'skyline_east', imageUrl: '/assets/generated/gen_scene_06_skyline_card2.jpg', title: 'Autumn Draft — East Tower', aspectClass: 'h-48 w-36' },
  { slotIndex: 6, workIndex: 0, sceneId: 'girl_looking_up', imageUrl: '/assets/generated/gen_scene_03_girl_card1.jpg', title: 'Upstairs — Afternoon', aspectClass: 'h-44 w-34' },
  { slotIndex: 7, workIndex: 1, sceneId: 'facade_clouds', imageUrl: '/assets/generated/gen_scene_04_lookup_card1.jpg', title: 'Paper Weather — Clearing', aspectClass: 'h-48 w-36' },
  { slotIndex: 8, workIndex: 2, sceneId: 'autumn_avenue', imageUrl: '/assets/generated/gen_scene_02_avenue_card1.jpg', title: 'Last Tram — Canopy', aspectClass: 'h-46 w-34' },
  { slotIndex: 9, workIndex: 3, sceneId: 'window_artist', imageUrl: '/assets/generated/gen_scene_05_studio_card2.jpg', title: 'Red Canopy — Studio', aspectClass: 'h-48 w-36' },
  { slotIndex: 10, workIndex: 4, sceneId: 'skyline_canopy', imageUrl: '/assets/generated/gen_scene_04_lookup_card2.jpg', title: 'Quiet Facade — Leaves', aspectClass: 'h-44 w-34' },
  { slotIndex: 11, workIndex: 5, sceneId: 'window_curtain', imageUrl: '/assets/generated/gen_scene_05_studio_card1.jpg', title: 'Autumn Draft — Curtain', aspectClass: 'h-48 w-36' },
];

export const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Sketch & Storyboard Wall',
    subtitle: '6B Pencil · Pegbar Registration · Paper Tooth',
    description:
      'Every film begins on our six-meter cork wall in Tokyo. Directors and key animators pin rough pencil thumbnails in sequence, adjusting rhythm before a single frame is digitized.',
  },
  {
    number: '02',
    title: 'Architectural Layout',
    subtitle: 'Multiplane Depth · Perspective Grids · Light Keys',
    description:
      'We separate each urban scene into 4 to 5 physical depth beds—foreground foliage, street-level architecture, drifting clouds, and distant skyline haze.',
  },
  {
    number: '03',
    title: 'Hand-Brushed Gouache',
    subtitle: 'Nicker Poster Color · Heavy Cotton Paper · Wet-on-Dry',
    description:
      'Background painters mix mineral pigments by hand. Rather than flat digital fills, every window reflection and cumulus shadow carries real bristle texture.',
  },
  {
    number: '04',
    title: '24 FPS Camera Composite',
    subtitle: 'On Twos & Threes · Optical Diffusion · Film Gate',
    description:
      'Scanned beds are assembled on our virtual multiplane rostrum where natural paper grain, subtle camera drift, and cel shadows lock together at 24 frames per second.',
  },
];

export const JOURNAL_ENTRIES = [
  {
    date: 'October 2026',
    readTime: '4 min read',
    title: 'Why We Still Paint Clouds on 240gsm Cotton Paper',
    excerpt:
      'Digital brushes can mimic texture, but they rarely surprise you. How water drying on cotton paper dictates the pacing of our opening sky shots.',
  },
  {
    date: 'September 2026',
    readTime: '6 min read',
    title: 'Mixing Autumn: Four Pigments Behind Last Tram',
    excerpt:
      'A look inside our colour kitchen—balancing cadmium orange, burnt sienna, and ultramarine ash to capture 4:45 PM light between tall buildings.',
  },
  {
    date: 'August 2026',
    readTime: '3 min read',
    title: 'Timing Wind on Threes: Notes from Upstairs',
    excerpt:
      'How a single white curtain and seven maple leaves taught us to slow down camera pans and let empty space breathe.',
  },
];

export const CAREERS_OPENINGS = [
  {
    role: 'Background Painter (Gouache & Poster Color)',
    type: 'Full-time · Tokyo Studio / Hybrid',
    department: 'Paint Department',
    summary: 'Seeking an experienced traditional painter comfortable with urban architectural layouts and atmospheric skies.',
  },
  {
    role: '2D Key Animator (Rough & Clean-Up)',
    type: 'Contract / Project-based · Remote or Tokyo',
    department: 'Animation',
    summary: 'Animate subtle character acting, fabric wind physics, and natural phenomena on 2s and 3s.',
  },
  {
    role: 'Multiplane Compositing Artist',
    type: 'Full-time · Tokyo Studio',
    department: 'Camera & Rostrum',
    summary: 'Assemble high-resolution scanned gouache beds with delicate depth-of-field, halation, and film gate timing.',
  },
];
