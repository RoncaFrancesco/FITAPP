import { Exercise, MuscleGroup, Equipment, Difficulty, ExerciseCategory } from '../types';

export const EXERCISES: Exercise[] = [
  // Petto
  {
    id: 'pushup',
    name: 'Push-up',
    description: 'Esercizio a corpo libero per petto, spalle e tricipiti',
    instructions: [
      'Parti in posizione plank con mani leggermente più larghe delle spalle',
      'Mantieni il corpo in linea retta dalla testa ai piedi',
      'Abbassa il petto verso il terreno piegando le braccia',
      'Spingi verso l\'alto tornando alla posizione iniziale'
    ],
    muscleGroup: MuscleGroup.CHEST,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'bench-press',
    name: 'Panca piana',
    description: 'Esercizio fondamentale per lo sviluppo del petto',
    instructions: [
      'Sdraiati sulla panca con i piedi appoggiati a terra',
      'Afferra il bilanciere con presa leggermente più larga delle spalle',
      'Abbassa il bilanciere controllato fino al petto',
      'Spingi verso l\'alto tornando alla posizione iniziale'
    ],
    muscleGroup: MuscleGroup.CHEST,
    equipment: [Equipment.BARBELL, Equipment.BENCH],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'dumbbell-press',
    name: 'Panca piana con manubri',
    description: 'Variante della panca piana per migliore attivazione muscolare',
    instructions: [
      'Sdraiati sulla panca con un manubrio in ogni mano',
      'Parti con i manubri all\'altezza del petto',
      'Spingi verso l\'alto fino a estendere completamente le braccia',
      'Controlla la discesa tornando alla posizione iniziale'
    ],
    muscleGroup: MuscleGroup.CHEST,
    equipment: [Equipment.DUMBBELLS, Equipment.BENCH],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'incline-press',
    name: 'Panca inclinata',
    description: 'Esercizio per la parte superiore del petto',
    instructions: [
      'Sdraiati su panca inclinata a 30-45 gradi',
      'Afferra il bilanciere con presa leggermente più larga delle spalle',
      'Abbassa controllato fino al petto',
      'Spingi verso l\'alto mantenendo la traiettoria'
    ],
    muscleGroup: MuscleGroup.CHEST,
    equipment: [Equipment.BARBELL, Equipment.BENCH],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'dumbbell-flyes',
    name: 'Croci con manubri',
    description: 'Esercizio di isolamento per il petto',
    instructions: [
      'Sdraiati sulla panca con manubri in mano (palmi verso l\'interno)',
      'Parti con le braccia estese sopra il petto',
      'Apri le braccia lateralmente mantenendo leggera flessione',
      'Richiudi controllato tornando alla posizione iniziale'
    ],
    muscleGroup: MuscleGroup.CHEST,
    equipment: [Equipment.DUMBBELLS, Equipment.BENCH],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'dips',
    name: 'Dips alle parallele',
    description: 'Esercizio completo per petto, tricipiti e spalle',
    instructions: [
      'Afferra le parallele con braccia tese',
      'Abbassi il corpo controllato piegando le braccia',
      'Scendi fino a formare 90 gradi con i gomiti',
      'Spingi verso l\'alto tornando alla posizione iniziale'
    ],
    muscleGroup: MuscleGroup.CHEST,
    equipment: [Equipment.PARALLELS],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'cable-flyes',
    name: 'Croci ai cavi',
    description: 'Esercizio di isolamento con tensione continua',
    instructions: [
      'Posizionato tra i due cavi con maniglie alte',
      'Afferra le maniglie con passo avanti',
      'Porta le mani insieme davanti al petto',
      'Controlla la fase eccentrica tornando indietro'
    ],
    muscleGroup: MuscleGroup.CHEST,
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'pushup-variations',
    name: 'Push-up declinati',
    description: 'Variante più intensa del push-up tradizionale',
    instructions: [
      'Posiziona i piedi su un rialzo (panca, sedia)',
      'Mantieni il corpo in linea retta',
      'Esegui push-up con maggiore resistenza',
      'Controlla il movimento in tutta la sua ampiezza'
    ],
    muscleGroup: MuscleGroup.CHEST,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },

  // Schiena
  {
    id: 'pullup',
    name: 'Trazioni alla sbarra',
    description: 'Esercizio re per lo sviluppo della schiena',
    instructions: [
      'Afferra la sbarra con presa pronata (palme avanti)',
      'Parti da braccia tese scendendo completamente',
      'Tira su il petto fino a superare la sbarra',
      'Controlla la discesa lentamente'
    ],
    muscleGroup: MuscleGroup.BACK,
    equipment: [Equipment.PULLUP_BAR],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'chinup',
    name: 'Trazioni presa supina',
    description: 'Variante che enfatizza i bicipiti',
    instructions: [
      'Afferra la sbarra con presa supina (palme indietro)',
      'Mantieni le spalle basse e indietro',
      'Tira finché il mento non supera la sbarra',
      'Scendi controllato mantenendo il controllo'
    ],
    muscleGroup: MuscleGroup.BACK,
    equipment: [Equipment.PULLUP_BAR],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'deadlift',
    name: 'Stacchi da terra',
    description: 'Esercizio fondamentale per forza totale',
    instructions: [
      'Piedi larghi quanto le spalle, bilanciere sugli stinchi',
      'Piega le ginocchia e fletti in avanti mantenendo la schiena dritta',
      'Afferra il bilanciere e solleva estendendo anche le gambe',
      'Mantieni la schiena neutra durante tutto il movimento'
    ],
    muscleGroup: MuscleGroup.BACK,
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.ADVANCED,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'bentover-row',
    name: 'Rematore con bilanciere',
    description: 'Esercizio base per lo spessore della schiena',
    instructions: [
      'Piedi larghi quanto le spalle, ginocchia leggermente piegate',
      'Fletti in avanti mantenendo la schiena dritta',
      'Tira il bilanciere verso l\'addome contraendo i dorsali',
      'Controlla la fase di discesa'
    ],
    muscleGroup: MuscleGroup.BACK,
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'dumbbell-row',
    name: 'Rematore con manubrio',
    description: 'Esercizio unilaterale per schiena e bicipiti',
    instructions: [
      'Appoggia ginocchio e mano su panca',
      'Mantieni la schiena parallela al terreno',
      'Tira il manubrio verso l\'anca controendo il dorso',
      'Controlla la discesa mantenendo la tensione'
    ],
    muscleGroup: MuscleGroup.BACK,
    equipment: [Equipment.DUMBBELLS, Equipment.BENCH],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'lat-pulldown',
    name: 'Lat machine',
    description: 'Esercizio per allargare la schiena',
    instructions: [
      'Siedi e fissa le ginocchia sotto il supporto',
      'Afferra la sbarra larga quanto le spalle',
      'Tira verso il petto mantenendo le spalle basse',
      'Controlla la risalita mantenendo la postura'
    ],
    muscleGroup: MuscleGroup.BACK,
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'seated-cable-row',
    name: 'Rematore seduto ai cavi',
    description: 'Esercizio per lo spessore della schiena',
    instructions: [
      'Siedi con gambe leggermente piegate',
      'Afferra la maniglia con braccia tese',
      'Tira verso l\'addome mantenendo la schiena dritta',
      'Controlla la fase di ritorno'
    ],
    muscleGroup: MuscleGroup.BACK,
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    description: 'Esercizio per spalle e schiena alta',
    instructions: [
      'Collega la corda alla puleggia alta',
      'Afferra la corda con palmi verso il basso',
      'Tira verso il viso ruotando le spalle',
      'Mantieni gomiti alti durante il movimento'
    ],
    muscleGroup: MuscleGroup.BACK,
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },

  // Spalle
  {
    id: 'overhead-press',
    name: 'Military press',
    description: 'Esercizio base per lo sviluppo delle spalle',
    instructions: [
      'In piedi con piedi larghi quanto le spalle',
      'Bilanciere davanti al petto a livello delle clavicole',
      'Spingi verso l\'alto fino a estendere le braccia',
      'Controlla la discesa mantenendo la postura'
    ],
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'dumbbell-press',
    name: 'Panca verticale con manubri',
    description: 'Variante del military press con manubri',
    instructions: [
      'Siedi con schiena appoggiata allo schienale',
      'Manubri all\'altezza delle spalle con palmi avanti',
      'Spingi verso l\'alto fino a toccare i manubri',
      'Controlla la discesa mantenendo stabilità'
    ],
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'lateral-raise',
    name: 'Alzate laterali',
    description: 'Esercizio di isolamento per i deltoidi laterali',
    instructions: [
      'In piedi con manubri ai latri del corpo',
      'Mantieni gomiti leggermente piegati',
      'Alza le braccia lateralmente fino all\'altezza delle spalle',
      'Controlla la discesa mantenendo tensione'
    ],
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'front-raise',
    name: 'Alzate frontali',
    description: 'Esercizio per i deltoidi anteriori',
    instructions: [
      'In piedi con manubri anteriori alle cosce',
      'Mantieni braccia leggermente piegate',
      'Alza le braccia davanti fino all\'altezza spalle',
      'Controlla la fase eccentrica'
    ],
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'rear-delt-fly',
    name: 'Alzate posteriori',
    description: 'Esercizio per deltoidi posteriori',
    instructions: [
      'In piedi piegato in avanti a 90 gradi',
      'Manubri pendenti verso il terreno',
      'Alza le braccia lateralmente contraendo i deltoidi',
      'Mantieni gomiti alti durante il movimento'
    ],
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'upright-row',
    name: 'Upright row',
    description: 'Esercizio composto per spalle e trapezi',
    instructions: [
      'In piedi con bilanciere davanti al corpo',
      'Affonda con presa stretta (20-30cm)',
      'Tira verso il mento mantenendo i gomiti alti',
      'Controlla la discesa lungo il petto'
    ],
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'shrugs',
    name: 'Shrugs',
    description: 'Esercizio per i trapezi',
    instructions: [
      'In piedi con manubri ai latri del corpo',
      'Mantieni braccia tese durante tutto il movimento',
      'Alza le spalle verso le orecchie',
      'Mantieni la posizione 1 secondo poi scendi'
    ],
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'arnold-press',
    name: 'Arnold press',
    description: 'Variante dinamica del shoulder press',
    instructions: [
      'Siedi con manubri all\'altezza spalle (palmi corpo)',
      'Mentre spingi verso l\'alto, ruota i palmi fuori',
      'In cima, palmi devono essere rivolti avanti',
      'Inverti la rotazione durante la discesa'
    ],
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },

  // Braccia - Bicipiti
  {
    id: 'bicep-curl',
    name: 'Curl con bilanciere',
    description: 'Esercizio base per i bicipiti',
    instructions: [
      'In piedi con bilanciere presa supina',
      'Gomiti fermi ai latri del busto',
      'Curla il bilanciere verso le spalle',
      'Controlla la fase eccentrica'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'dumbbell-curl',
    name: 'Curl con manubri',
    description: 'Variante del curl con manubri',
    instructions: [
      'In piedi con manubrio in mano',
      'Mantieni gomito fermo al fianco',
      'Curla il manubrio verso la spalla',
      'Ruota il polso (supinazione) durante la salita'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'hammer-curl',
    name: 'Hammer curl',
    description: 'Variante che enfatizza brachiale e avambracci',
    instructions: [
      'In piedi con manubrio impugnatura neutra',
      'Mantieni i palmi rivolti l\'uno verso l\'altro',
      'Curla mantenendo la presa hammer',
      'Mantieni gomiti fermi durante il movimento'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'concentration-curl',
    name: 'Curl di concentrazione',
    description: 'Esercizio di isolamento per bicipiti',
    instructions: [
      'Siedi con gambe divaricate',
      'Gomito appoggiato all\'interno della coscia',
      'Curla il manubrio verso la spalla',
      'Massima contrazione in alto, controllata discesa'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'preacher-curl',
    name: 'Curl panca Scott',
    description: 'Esercizio con gomiti fissati',
    instructions: [
      'Appoggia le braccia sulla panca Scott',
      'Mantieni il petto aderente alla panca',
      'Curla estendendo completamente i bicipiti',
      'Evita di usare lo slancio del corpo'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.DUMBBELLS, Equipment.BENCH],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },

  // Braccia - Tricipiti
  {
    id: 'tricep-dips',
    name: 'Dips per tricipiti',
    description: 'Esercizio bodyweight per tricipiti',
    instructions: [
      'Appoggia le mani su panca o bordo resistente',
      'Gambe tese con talloni a terra',
      'Scendi piegando i gomiti a 90 gradi',
      'Spingi verso l\'alto tornando alla posizione iniziale'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.BODYWEIGHT, Equipment.BENCH],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'skullcrushers',
    name: 'Skull crushers',
    description: 'Esercizio di isolamento per tricipiti',
    instructions: [
      'Sdraiati su panca con manubri',
      'Braccia estese verso il cielo',
      'Abbassa solo gli avambracci verso la fronte',
      'Estendi nuovamente controllando il movimento'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.DUMBBELLS, Equipment.BENCH],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'tricep-pushdown',
    name: 'Push down ai cavi',
    description: 'Esercizio con tensione continua',
    instructions: [
      'Di fronte alla puleggia alta',
      'Afferra la barra con presa stretta',
      'Spingi verso il basso estendendo le braccia',
      'Controlla la risalita mantenendo i gomiti fermi'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'overhead-tricep',
    name: 'Estensioni sopra la testa',
    description: 'Allungamento massimo dei tricipiti',
    instructions: [
      'In piedi o seduto con manubrio a due mani',
      'Braccia estese sopra la testa',
      'Abbassi il manubrio dietro la nuca',
      'Estendi tornando alla posizione iniziale'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.DUMBBELLS],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'close-grip-bench',
    name: 'Panca presa stretta',
    description: 'Esercizio composto per tricipiti e petto',
    instructions: [
      'Sdraiati su panca con presa stretta (20-30cm)',
      'Mantieni i gomiti vicini al corpo',
      'Abbassa il bilanciere sul basso petto',
      'Spingi verso l\'alto contraendo i tricipiti'
    ],
    muscleGroup: MuscleGroup.ARMS,
    equipment: [Equipment.BARBELL, Equipment.BENCH],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },

  // Gambe
  {
    id: 'squat',
    name: 'Squat con bilanciere',
    description: 'Esercizio fondamentale per le gambe',
    instructions: [
      'Posizionati sotto il bilanciere con piedi larghi spalle',
      'Bilanciere su trapezi non sul collo',
      'Scendi come sederti su una sedia invisibile',
      'Mantieni schiena dritta e ginocchia allineate piedi'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'bodyweight-squat',
    name: 'Squat a corpo libero',
    description: 'Versione bodyweight dello squat',
    instructions: [
      'Piedi larghi quanto le spalle',
      'Dita leggermente rivolte fuori',
      'Scendi fino a parallelo o più basso',
      'Mantieni petto alto e schiena dritta'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'front-squat',
    name: 'Squat frontale',
    description: 'Variante con maggior enfasi sui quadricipiti',
    instructions: [
      'Bilanciere davanti alle spalle sulle dita',
      'Gomiti alti e petto in fuori',
      'Scendi mantenendo la schiena dritta',
      'Mantieni i gomiti alti durante tutta l\'esecuzione'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.ADVANCED,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'bulgarian-split',
    name: 'Split squat bulgaro',
    description: 'Esercizio unilaterale per gambe e glutei',
    instructions: [
      'Metti un piede su panca dietro di te',
      'Piedi distanziati come per uno squat',
      'Scendi con la gamba anteriore',
      'Mantieni il busto eretto durante il movimento'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BODYWEIGHT, Equipment.BENCH],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'lunges',
    name: 'Affondi',
    description: 'Esercizio per equilibrio e forza gambe',
    instructions: [
      'In piedi con piedi paralleli',
      'Fai un grande passo avanti con una gamba',
      'Scendi fino a formare 90 gradi con entrambe le ginocchia',
      'Spingi indietro tornando alla posizione iniziale'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'deadlift-romanian',
    name: 'Stacchi rumeni',
    description: 'Esercizio per bicipiti femorali e glutei',
    instructions: [
      'In piedi con bilanciere davanti',
      'Gambe leggermente piegate (mantenere tale angolazione)',
      'Fletti in avanti mantenendo la schiena dritta',
      'Senti lo stiramento sui femorali, poi torna su'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'leg-press',
    name: 'Leg press',
    description: 'Esercizio guidato per le gambe',
    instructions: [
      'Siedi sulla macchina leg press',
      'Piedi larghi quanto le spalle sulla piattaforma',
      'Spingi via la piattaforma con le gambe',
      'Controlla la fase di ritorno non scendere troppo'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'leg-curls',
    name: 'Leg curls',
    description: 'Esercizio per bicipiti femorali',
    instructions: [
      'Sdraiati sulla macchina leg curls',
      'Fissa le caviglie sotto il rullo',
        'Fletti le gambe portando i talloni verso i glutei',
      'Controlla la discesa mantenendo tensione'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'leg-extensions',
    name: 'Leg extensions',
    description: 'Esercizio di isolamento per quadricipiti',
    instructions: [
      'Siedi sulla macchina leg extensions',
      'Schiena ben aderente allo schienale',
      'Estendi le gambe completamente',
      'Controlla la discesa mantenendo tensione'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'calf-raises',
    name: 'Calf raises',
    description: 'Esercizio per polpacci',
    instructions: [
      'In piedi sulle punte dei piedi',
      'Mantieni le ginocchia leggermente piegate',
      'Spingi verso l\'alto sui polpacci',
      'Mantieni la contrazione 1 secondo poi scendi'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.HYPERTROPHY,
    isCustom: false
  },
  {
    id: 'glute-bridge',
    name: 'Glute bridge',
    description: 'Esercizio per glutei e core',
    instructions: [
      'Sdraiati supini con ginocchia piegate',
      'Piedi appoggiati a terra a larghezza bacino',
      'Solleva i fianchi contraendo i glutei',
      'Mantieni la posizione 2 secondi poi scendi'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'hip-thrust',
    name: 'Hip thrust',
    description: 'Esercizio avanzato per glutei',
    instructions: [
      'Sdraiati con schiena su panca',
      'Piedi a terra a larghezza bacino',
      'Solleva i fianchi fino a parallelo spalle-ginocchia',
      'Mantieni contrazione massima in alto'
    ],
    muscleGroup: MuscleGroup.LEGS,
    equipment: [Equipment.BODYWEIGHT, Equipment.BENCH],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },

  // Core
  {
    id: 'plank',
    name: 'Plank',
    description: 'Esercizio isometrico per il core',
    instructions: [
      'Posizione prone su avambracci e punte piedi',
      'Corpo in linea retta dalla testa ai piedi',
      'Glutei contratti, addome in dentro',
      'Mantieni la posizione senza far oscillare il bacino'
    ],
    muscleGroup: MuscleGroup.CORE,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'side-plank',
    name: 'Side plank',
    description: 'Plank laterale per obliqui',
    instructions: [
      'Su un fianco appoggiato su avambraccio',
      'Corpo in linea retta',
      'Solleva i fianchi verso il cielo',
      'Mantieni posizione senza far crollare il bacino'
    ],
    muscleGroup: MuscleGroup.CORE,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'crunches',
    name: 'Crunch',
    description: 'Esercizio base per addominali',
    instructions: [
      'Sdraiato supino con ginocchia piegate',
      'Mano dietro la nuca (non tirare la testa)',
      'Solleva spalle da terra contraendo addome',
      'Torna giù controllato senza rilassare completamente'
    ],
    muscleGroup: MuscleGroup.CORE,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'leg-raise',
    name: 'Leg raise',
    description: 'Esercizio per addominali bassi',
    instructions: [
      'Sdraiato supino con gambe tese',
      'Mani sotto i glutei per stabilità',
      'Solleva le gambe tese fino a 90 gradi',
      'Controlla la discesa lentamente'
    ],
    muscleGroup: MuscleGroup.CORE,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'russian-twist',
    name: 'Russian twist',
    description: 'Esercizio per obliqui',
    instructions: [
      'Seduto a terra con ginocchia piegate',
      'Corpo leggermente inclinato indietro',
      'Ruota il busto lateralmente toccando terra',
      'Mantieni i piedi sollevati per maggiore difficoltà'
    ],
    muscleGroup: MuscleGroup.CORE,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },
  {
    id: 'mountain-climber',
    name: 'Mountain climber',
    description: 'Esercizio dinamico per core e cardio',
    instructions: [
      'Posizione plank con braccia tese',
      'Porta alternativamente le ginocchia al petto',
      'Mantieni i fianchi bassi e core contratto',
      'Esegui rapidamente per effetto cardio'
    ],
    muscleGroup: MuscleGroup.CORE,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.CARDIO,
    isCustom: false
  },
  {
    id: 'bird-dog',
    name: 'Bird dog',
    description: 'Esercizio per stabilità core',
    instructions: [
      'Posizione quadrupedia (a 4 zampe)',
      'Spiega braccio destro e gamba sinistra',
      'Mantieni equilibrato senza ruotare il bacino',
      'Torna in posizione e alterna i lati'
    ],
    muscleGroup: MuscleGroup.CORE,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.STRENGTH,
    isCustom: false
  },

  // Cardio
  {
    id: 'jumping-jacks',
    name: 'Jumping jacks',
    description: 'Esercizio cardio a corpo libero',
    instructions: [
      'In piedi con braccia lungo i fianchi',
      'Salta aprendo gambe e alzando braccia',
      'Ritorna in posizione chiusa',
      'Mantieni ritmo costante e respiro regolare'
    ],
    muscleGroup: MuscleGroup.CARDIO,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.CARDIO,
    isCustom: false
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Esercizio completo cardio e forza',
    instructions: [
      'In piedi, scendi in squat e appoggia mani a terra',
      'Salta indietro in posizione plank',
      'Esegui un push-up opzionale',
      'Salta avanti in squat poi salta verso l\'alto'
    ],
    muscleGroup: MuscleGroup.CARDIO,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.INTERMEDIATE,
    category: ExerciseCategory.CARDIO,
    isCustom: false
  },
  {
    id: 'high-knees',
    name: 'High knees',
    description: 'Corsa sul posto con ginocchia alte',
    instructions: [
      'Corri sul posto sollevando le ginocchia',
      'Braccia coordinate come nella corsa',
      'Mantieni ritmo elevato',
      'Core contratto durante tutto il movimento'
    ],
    muscleGroup: MuscleGroup.CARDIO,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.CARDIO,
    isCustom: false
  },
  {
    id: 'butt-kicks',
    name: 'Butt kicks',
    description: 'Corsa sul posto colpendo i glutei',
    instructions: [
      'Corri sul posto portando i talloni ai glutei',
      'Mantieni busto eretto e core contratto',
      'Braccia coordinate naturalmente',
      'Aumenta gradualmente la velocità'
    ],
    muscleGroup: MuscleGroup.CARDIO,
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    category: ExerciseCategory.CARDIO,
    isCustom: false
  }
];

// Funzione per popolare il database con gli esercizi
export const populateExercises = async () => {
  try {
    const { db } = await import('../db');
    await db.open();

    // Verifica se gli esercizi sono già presenti
    const existingCount = await db.exercises.count();
    if (existingCount >= EXERCISES.length) {
      console.log('Gli esercizi sono già presenti nel database');
      return;
    }

    // Aggiungi gli esercizi al database
    await db.exercises.bulkAdd(EXERCISES);
    console.log(`Aggiunti ${EXERCISES.length} esercizi al database`);

    return EXERCISES.length;
  } catch (error) {
    console.error('Errore durante il popolamento degli esercizi:', error);
    throw error;
  }
};