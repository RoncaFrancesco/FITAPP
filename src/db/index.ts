import Dexie, { Table } from 'dexie';
import { Exercise, Workout, WorkoutSession, UserPreferences } from '../types';

export class FitnessDatabase extends Dexie {
  exercises!: Table<Exercise>;
  workouts!: Table<Workout>;
  sessions!: Table<WorkoutSession>;
  preferences!: Table<UserPreferences>;

  constructor() {
    super('FitnessDatabase');

    this.version(1).stores({
      exercises: 'id, name, muscleGroup, category, difficulty, isCustom',
      workouts: 'id, name, createdAt, isCustom',
      sessions: 'id, workoutId, startTime, completed',
      preferences: 'id'
    });
  }

  async initializeDefaultData() {
    const exerciseCount = await this.exercises.count();
    if (exerciseCount === 0) {
      await this.loadDefaultExercises();
    }

    const preferencesCount = await this.preferences.count();
    if (preferencesCount === 0) {
      await this.preferences.add({
        theme: 'system',
        defaultRestTime: 60,
        defaultTimerSettings: {
          type: 'single',
          workTime: 30,
          restTime: 60,
          rounds: 1,
          cycles: 1,
          preparationTime: 5,
          soundEnabled: true,
          vibrationEnabled: true
        },
        language: 'it',
        units: 'metric',
        notifications: {
          workoutReminders: true,
          achievementAlerts: true
        },
        ai: {
          useGemini: true
        }
      });
    }
  }

  private async loadDefaultExercises() {
    const defaultExercises: Exercise[] = [
      // Petto
      {
        id: '1',
        name: 'Panca Piana',
        description: 'Esercizio fondamentale per lo sviluppo del petto',
        instructions: [
          'Sdraiati sulla panca con i piedi a terra',
          'Afferra il bilanciere con presa leggermente più larga delle spalle',
          'Abbassa il bilanciere controllando fino al petto',
          'Spingi verso l\'alto espandendo il petto'
        ],
        muscleGroup: 'petto' as any,
        equipment: ['bilanciere', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '2',
        name: 'Panca Inclinata',
        description: 'Sviluppa la parte superiore del petto',
        instructions: [
          'Imposta la panca a 30-45 gradi',
          'Afferra il bilanciere con presa leggermente più larga delle spalle',
          'Abbassa controllando fino al petto',
          'Spingi verso l\'alto contraendo il petto'
        ],
        muscleGroup: 'petto' as any,
        equipment: ['bilanciere', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '3',
        name: 'Croci ai cavi',
        description: 'Isolamento del petto con elastici',
        instructions: [
          'Posizionati tra i cavi',
          'Afferra le maniglie con i palmi rivolti in avanti',
          'Apri le braccia mantenendo una leggera flessione',
          'Richiudi incrociando le mani davanti al petto'
        ],
        muscleGroup: 'petto' as any,
        equipment: ['cavi'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '4',
        name: 'Flessioni',
        description: 'Esercizio a corpo libero per il petto',
        instructions: [
          'Parti in posizione plank sulle mani',
          'Mantieni il corpo allineato',
          'Scendi fino a quasi toccare il pavimento',
          'Spingi verso l\'alto tornando alla posizione iniziale'
        ],
        muscleGroup: 'petto' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '5',
        name: 'Dips alle parallele',
        description: 'Esercizio completo per petto e tricipiti',
        instructions: [
          'Sali sulle parallele con le braccia tese',
          'Scendi controllando fino a 90 gradi',
          'Spingi verso l\'alto contraendo petto e tricipiti',
          'Non sbloccare completamente i gomiti'
        ],
        muscleGroup: 'petto' as any,
        equipment: ['parallele'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      // Schiena
      {
        id: '6',
        name: 'Trazioni',
        description: 'Re per lo sviluppo della schiena',
        instructions: [
          'Afferra la sbarra con presa prona',
          'Parti da braccia tese',
          'Tira il petto verso la sbarra',
          'Scendi controllando'
        ],
        muscleGroup: 'schiena' as any,
        equipment: ['sbarra'] as any,
        difficulty: 'avanzato' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '7',
        name: 'Rematore con bilanciere',
        description: 'Sviluppa la densità della schiena',
        instructions: [
          'Piega le ginocchia e la schiena',
          'Afferra il bilanciere con presa prona',
          'Tira verso l\'addome contraendo i dorsali',
          'Rilascia controllando'
        ],
        muscleGroup: 'schiena' as any,
        equipment: ['bilanciere'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '8',
        name: 'Lat Machine',
        description: 'Isolamento dei dorsali',
        instructions: [
          'Siediti con le gambe bloccate',
          'Afferra la barra con presa larga',
          'Tira verso il petto contraendo i dorsali',
          'Rilascia controllando'
        ],
        muscleGroup: 'schiena' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '9',
        name: 'Stacchi da terra',
        description: 'Esercizio fondamentale per tutta la schiena',
        instructions: [
          'Piedi alla larghezza delle spalle',
          'Afferra il bilanciere con le ginocchia piegate',
          'Solleva estendendo anche e gambe',
          'Mantieni la schiena dritta'
        ],
        muscleGroup: 'schiena' as any,
        equipment: ['bilanciere'] as any,
        difficulty: 'avanzato' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '10',
        name: 'Pulley basso',
        description: 'Sviluppo della bassa schiena',
        instructions: [
          'Siediti con i piedi appoggiati',
          'Afferra la maniglia con entrambe le mani',
          'Tira verso l\'addome contraendo i dorsali',
          'Rilascia controllando'
        ],
        muscleGroup: 'schiena' as any,
        equipment: ['cavi'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      // Spalle
      {
        id: '11',
        name: 'Alzate laterali',
        description: 'Sviluppo del deltoide laterale',
        instructions: [
          'In piedi con manubri ai lati',
          'Alza le braccia lateralmente fino alle spalle',
          'Mantieni i gomiti leggermente piegati',
          'Scendi controllando'
        ],
        muscleGroup: 'spalle' as any,
        equipment: ['manubri'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '12',
        name: 'Military Press',
        description: 'Sviluppo complessivo delle spalle',
        instructions: [
          'In piedi con bilanciere davanti al petto',
          'Spingi verso l\'alto estendendo le braccia',
          'Mantieni la schiena dritta',
          'Scendi controllando'
        ],
        muscleGroup: 'spalle' as any,
        equipment: ['bilanciere'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '13',
        name: 'Alzate frontali',
        description: 'Sviluppo del deltoide anteriore',
        instructions: [
          'In piedi con manubri davanti alle cosce',
          'Alza le braccia davanti fino alle spalle',
          'Mantieni i gomiti leggermente piegati',
          'Scendi controllando'
        ],
        muscleGroup: 'spalle' as any,
        equipment: ['manubri'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '14',
        name: 'Alzate posteriori',
        description: 'Sviluppo del deltoide posteriore',
        instructions: [
          'Piegato in avanti con manubri',
          'Alza le braccia lateralmente e indietro',
          'Contraendo i deltoidi posteriori',
          'Scendi controllando'
        ],
        muscleGroup: 'spalle' as any,
        equipment: ['manubri'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '15',
        name: 'Arnold Press',
        description: 'Variante del military press',
        instructions: [
          'In piedi con manubri davanti alle spalle',
          'Ruota i palmi verso l\'esterno mentre alzi',
          'Estendi completamente le braccia',
          'Ritorna controllando ruotando i palmi'
        ],
        muscleGroup: 'spalle' as any,
        equipment: ['manubri'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      // Braccia
      {
        id: '16',
        name: 'Curl bicipiti con manubri',
        description: 'Sviluppo bicipiti',
        instructions: [
          'In piedi con manubri ai lati',
          'Alza i manubri contrando i bicipiti',
          'Mantieni i gomiti fermi',
          'Scendi controllando'
        ],
        muscleGroup: 'braccia' as any,
        equipment: ['manubri'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '17',
        name: 'French Press',
        description: 'Sviluppo tricipiti',
        instructions: [
          'Sdraiato con manubrio sopra la testa',
          'Piega i gomiti abbassando il manubrio',
          'Estendi le braccia contrando i tricipiti',
          'Mantieni i gomiti fermi'
        ],
        muscleGroup: 'braccia' as any,
        equipment: ['manubri'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '18',
        name: 'Hammer Curl',
        description: 'Sviluppo brachiale e bicipiti',
        instructions: [
          'In piedi con manubri impugnatura a martello',
          'Alza i manubri contrando i bicipiti',
          'Mantieni i polsi neutri',
          'Scendi controllando'
        ],
        muscleGroup: 'braccia' as any,
        equipment: ['manubri'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '19',
        name: 'Push down ai cavi',
        description: 'Isolamento tricipiti',
        instructions: [
          'Davanti alla pulley alta',
          'Afferra la barra con presa prona',
          'Spingi verso il basso estendendo le braccia',
          'Rilascia controllando'
        ],
        muscleGroup: 'braccia' as any,
        equipment: ['cavi'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      // Gambe
      {
        id: '20',
        name: 'Squat',
        description: 'Esercizio fondamentale per le gambe',
        instructions: [
          'Piedi alla larghezza delle spalle',
          'Scendi piegando ginocchia e anche',
          'Mantieni la schiena dritta',
          'Spingi verso l\'alto con i talloni'
        ],
        muscleGroup: 'gambe' as any,
        equipment: ['bilanciere'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '21',
        name: 'Leg Press',
        description: 'Sviluppo gambe in sicurezza',
        instructions: [
          'Siediti sulla macchina leg press',
          'Piedi alla larghezza delle spalle',
          'Spingi con le gambe estendendo',
          'Rilascia controllando'
        ],
        muscleGroup: 'gambe' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '22',
        name: 'Affondi',
        description: 'Sviluppo gambe ed equilibrio',
        instructions: [
          'In piedi con piedi uniti',
          'Fai un passo in avanti',
          'Scendi fino a 90 gradi con entrambe le ginocchia',
          'Ritorna alla posizione iniziale'
        ],
        muscleGroup: 'gambe' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '23',
        name: 'Stacchi rumeni',
        description: 'Sviluppo femorali',
        instructions: [
          'In piedi con manubri',
          'Piega in avanti mantenendo gambe tese',
          'Scendi fino a sentire lo stretching',
          'Ritorna contraendo i glutei'
        ],
        muscleGroup: 'gambe' as any,
        equipment: ['manubri'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '24',
        name: 'Calf Raises',
        description: 'Sviluppo polpacci',
        instructions: [
          'In piedi sui piedini',
          'Solleva sui metatarsi',
          'Mantieni la contrazione',
          'Scendi controllando'
        ],
        muscleGroup: 'gambe' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      // Core
      {
        id: '25',
        name: 'Plank',
        description: 'Esercizio fondamentale per il core',
        instructions: [
          'Posizione plank sugli avambracci',
          'Corpo allineato da testa a piedi',
          'Contrai addome e glutei',
          'Mantieni la posizione'
        ],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'resistenza' as any,
        isCustom: false
      },
      {
        id: '26',
        name: 'Crunch',
        description: 'Sviluppo addominali',
        instructions: [
          'Sdraiato con ginocchia piegate',
          'Mano dietro la nuca',
          'Solleva le spalle contraendo gli addominali',
          'Ritorna controllando'
        ],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '27',
        name: 'Russian Twist',
        description: 'Sviluppo obliqui',
        instructions: [
          'Seduto con gambe sollevate',
          'Torre indietro a 45 gradi',
          'Ruota il busto lateralmente',
          'Mantieni la schiena dritta'
        ],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '28',
        name: 'Leg Raise',
        description: 'Sviluppo addominali inferiori',
        instructions: [
          'Sdraiato sulla schiena',
          'Gambe tese',
          'Solleva le gambe a 90 gradi',
          'Scendi controllando'
        ],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '29',
        name: 'Mountain Climber',
        description: 'Core e cardio',
        instructions: [
          'Posizione plank',
          'Porta alternativamente le ginocchia al petto',
          'Mantieni la schiena dritta',
          'Esegui rapidamente'
        ],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'intermedio' as any,
        category: 'cardio' as any,
        isCustom: false
      },
      // Cardio
      {
        id: '30',
        name: 'Burpees',
        description: 'Esercizio completo cardio',
        instructions: [
          'Parti in piedi',
          'Scendi in posizione squat',
          'Metti le mani a terra e salta in plank',
          'Torna in posizione squat e salta verso l\'alto'
        ],
        muscleGroup: 'cardio' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'intermedio' as any,
        category: 'cardio' as any,
        isCustom: false
      },
      {
        id: '31',
        name: 'Jumping Jacks',
        description: 'Cardio a corpo libero',
        instructions: [
          'Parti in piedi con braccia lungo i fianchi',
          'Salta aprendo gambe e braccia',
          'Ritorna alla posizione iniziale',
          'Esegui ritmicamente'
        ],
        muscleGroup: 'cardio' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'cardio' as any,
        isCustom: false
      },
      {
        id: '32',
        name: 'High Knees',
        description: 'Cardio dinamico',
        instructions: [
          'Corsa sul posto',
          'Solleva le ginocchia alte',
          'Braccia coordinate',
          'Mantieni un ritmo sostenuto'
        ],
        muscleGroup: 'cardio' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'cardio' as any,
        isCustom: false
      },
      // Stretching
      {
        id: '33',
        name: 'Stretching petto',
        description: 'Allungamento petto e spalle',
        instructions: [
          'Appoggiati a un muro o spigolo',
          'Braccio piegato a 90 gradi',
          'Ruota leggermente il busto',
          'Mantieni 30 secondi per lato'
        ],
        muscleGroup: 'stretching' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'flessibilità' as any,
        isCustom: false
      },
      {
        id: '34',
        name: 'Stretching schiena',
        description: 'Allungamento schiena',
        instructions: [
          'Seduto a gambe incrociate',
          'Ruota il busto lateralmente',
          'Appoggia il gomito opposto sul ginocchio',
          'Mantieni 30 secondi per lato'
        ],
        muscleGroup: 'stretching' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'flessibilità' as any,
        isCustom: false
      },
      {
        id: '35',
        name: 'Stretching spalle',
        description: 'Allungamento spalle',
        instructions: [
          'Porta un braccio sul petto',
          'Con l\'altra braccio tira verso il petto',
          'Mantieni 30 secondi',
          'Ripeti con l\'altro braccio'
        ],
        muscleGroup: 'stretching' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'flessibilità' as any,
        isCustom: false
      },
      {
        id: '36',
        name: 'Stretching quadricipiti',
        description: 'Allungamento quadricipiti',
        instructions: [
          'In piedi, afferra una caviglia',
          'Porta il tallone verso il gluteo',
          'Mantieni le ginocchia vicine',
          'Tieni 30 secondi per gamba'
        ],
        muscleGroup: 'stretching' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'flessibilità' as any,
        isCustom: false
      },
      {
        id: '37',
        name: 'Stretching femorali',
        description: 'Allungamento femorali',
        instructions: [
          'Seduto con una gamba tesa',
          'Piega verso la gamba tesa',
          'Mantieni la schiena dritta',
          'Tieni 30 secondi per gamba'
        ],
        muscleGroup: 'stretching' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'flessibilità' as any,
        isCustom: false
      },
      {
        id: '38',
        name: 'Stretching polpacci',
        description: 'Allungamento polpacci',
        instructions: [
          'Posizione spinta contro un muro',
          'Una gamba avanti piegata, l\'altra tesa',
          'Mantieni il tallone della gamba tesa a terra',
          'Tieni 30 secondi per gamba'
        ],
        muscleGroup: 'stretching' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'flessibilità' as any,
        isCustom: false
      },
      // Continuo con più esercizi...
      {
        id: '39',
        name: 'Panca declinata',
        description: 'Sviluppo parte inferiore del petto',
        instructions: [
          'Imposta la panca a -15 gradi',
          'Afferra il bilanciere con presa larga',
          'Abbassa controllando fino al petto',
          'Spingi verso l\'alto contraendo il petto'
        ],
        muscleGroup: 'petto' as any,
        equipment: ['bilanciere', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '40',
        name: 'Pull-up presa inversa',
        description: 'Trazioni con presa supina',
        instructions: [
          'Afferra la sbarra con presa inversa',
          'Parti da braccia tese',
          'Tira il petto verso la sbarra',
          'Scendi controllando'
        ],
        muscleGroup: 'schiena' as any,
        equipment: ['sbarra'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '41',
        name: 'Rematore con manubrio',
        description: 'Sviluppo schiena a braccio singolo',
        instructions: [
          'Appoggiato a una panca con un ginocchio',
          'Manubrio nell\'altra mano',
          'Tira verso l\'addome contraendo i dorsali',
          'Rilascia controllando'
        ],
        muscleGroup: 'schiena' as any,
        equipment: ['manubri', 'panca'] as any,
        difficulty: 'principiante' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '42',
        name: 'Face pulls',
        description: 'Sviluppo deltoide posteriore',
        instructions: [
          'Davanti alla pulley alta',
          'Affissa la corda con entrambe le mani',
          'Tira verso il viso ruotando i polsi',
          'Rilascia controllando'
        ],
        muscleGroup: 'spalle' as any,
        equipment: ['cavi'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '43',
        name: 'Preacher curl',
        description: 'Curl bicipiti con supporto',
        instructions: [
          'Appoggia i braccia sulla panca preacher',
          'Afferra il bilanciere o manubri',
          'Alza contrando i bicipiti',
          'Scendi controllando'
        ],
        muscleGroup: 'braccia' as any,
        equipment: ['bilanciere', 'panca preacher'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '44',
        name: 'Skull crushers',
        description: 'French press sdraiato',
        instructions: [
          'Sdraiato con bilanciere sopra la testa',
          'Piega i gomiti abbassando il bilanciere',
          'Estendi le braccia contrando i tricipiti',
          'Mantieni i gomiti fermi'
        ],
        muscleGroup: 'braccia' as any,
        equipment: ['bilanciere', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '45',
        name: 'Hack squat',
        description: 'Squat su macchina',
        instructions: [
          'Posizionati sulla macchina hack squat',
          'Spalle sotto i supporti',
          'Scendi piegando le ginocchia',
          'Spingi verso l\'alto con i talloni'
        ],
        muscleGroup: 'gambe' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        id: '46',
        name: 'Hip thrust',
        description: 'Sviluppo glutei',
        instructions: [
          'Appoggiato a una panca con la schiena',
          'Manubrio sui fianchi',
          'Solleva i fianchi contraendo i glutei',
          'Scendi controllando'
        ],
        muscleGroup: 'gambe' as any,
        equipment: ['manubri', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '47',
        name: 'Bicycle crunches',
        description: 'Addominali con movimento',
        instructions: [
          'Sdraiato con mani dietro la nuca',
          'Gambe sollevate e piegate',
          'Porta il gomito destro al ginocchio sinistro',
          'Alternate ritmicamente'
        ],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        id: '48',
        name: 'Side plank',
        description: 'Plank laterale',
        instructions: [
          'Appoggiato su un avambraccio',
          'Corpo allineato di lato',
          'Solleva i fianchi',
          'Mantieni la posizione'
        ],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'intermedio' as any,
        category: 'resistenza' as any,
        isCustom: false
      },
      {
        id: '49',
        name: 'Box jumps',
        description: 'Salto su box',
        instructions: [
          'Dinanzi a un box o step',
          'Salto con ampiezza di gambe',
          'Atterra morbido sul box',
          'Scendi controllando'
        ],
        muscleGroup: 'cardio' as any,
        equipment: ['box'] as any,
        difficulty: 'intermedio' as any,
        category: 'potenza' as any,
        isCustom: false
      },
      {
        id: '50',
        name: 'Kettlebell swing',
        description: 'Swing con kettlebell',
        instructions: [
          'Piedi alla larghezza delle spalle',
          'Kettlebell tra i piedi',
          'Proietta i fianchi avanti',
          'Lascia che la kettlebell salga fino all\'altezza del petto'
        ],
        muscleGroup: 'cardio' as any,
        equipment: ['kettlebell'] as any,
        difficulty: 'intermedio' as any,
        category: 'potenza' as any,
        isCustom: false
      }
    ];

    // Aggiungo altri esercizi per arrivare a 150+
    const additionalExercises: Omit<Exercise, 'id'>[] = [
      // Petto continuazione
      {
        name: 'Chest fly machine',
        description: 'Macchina per croci petto',
        instructions: ['Siediti sulla macchina', 'Afferra le maniglie', 'Apri le braccia', 'Richiudi contrando il petto'],
        muscleGroup: 'petto' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        name: 'Incline dumbbell press',
        description: 'Panca inclinata con manubri',
        instructions: ['Panca a 30 gradi', 'Manubri sopra le spalle', 'Scendi controllando', 'Spingi verso l\'alto'],
        muscleGroup: 'petto' as any,
        equipment: ['manubri', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        name: 'Decline dumbbell press',
        description: 'Panca declinata con manubri',
        instructions: ['Panca a -15 gradi', 'Manubri sopra le spalle', 'Scendi controllando', 'Spingi verso l\'alto'],
        muscleGroup: 'petto' as any,
        equipment: ['manubri', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        name: 'Push-up variations',
        description: 'Variazioni flessioni',
        instructions: ['Parti in posizione plank', 'Esegui flessioni con diverse posizioni', 'Mantieni la forma corretta'],
        muscleGroup: 'petto' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      // Schiena continuazione
      {
        name: 'Bent over row',
        description: 'Rematore piegato',
        instructions: ['Piega in avanti con schiena dritta', 'Manubri in mano', 'Tira verso l\'addome', 'Rilascia controllando'],
        muscleGroup: 'schiena' as any,
        equipment: ['manubri'] as any,
        difficulty: 'principiante' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        name: 'T-bar row',
        description: 'Rematore con T-bar',
        instructions: ['Appoggiato alla macchina', 'Afferra la T-bar', 'Tira verso l\'addome', 'Rilascia controllando'],
        muscleGroup: 'schiena' as any,
        equipment: ['macchina'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        name: 'Seated cable row',
        description: 'Rematore seduto ai cavi',
        instructions: ['Siediti alla macchina', 'Affitta la barra', 'Tira verso l\'addome', 'Rilascia controllando'],
        muscleGroup: 'schiena' as any,
        equipment: ['cavi'] as any,
        difficulty: 'principiante' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        name: 'Straight arm pulldown',
        description: 'Pulldown a braccia tese',
        instructions: ['Davanti alla lat machine', 'Afferra la barra', 'Tira verso il basso a braccia tese', 'Rilascia controllando'],
        muscleGroup: 'schiena' as any,
        equipment: ['cavi'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      // Spalle continuazione
      {
        name: 'Dumbbell shoulder press',
        description: 'Military press con manubri',
        instructions: ['Seduto con schiena dritta', 'Manubri sopra le spalle', 'Spingi verso l\'alto', 'Scendi controllando'],
        muscleGroup: 'spalle' as any,
        equipment: ['manubri', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        name: 'Upright row',
        description: 'Alzate mento',
        instructions: ['In piedi con bilanciere', 'Alza il bilanciere verso il mento', 'Mantieni i gomiti alti', 'Scendi controllando'],
        muscleGroup: 'spalle' as any,
        equipment: ['bilanciere'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        name: 'Shrugs',
        description: 'Alzate spalle',
        instructions: ['In piedi con manubri', 'Alza le spalle verso le orecchie', 'Mantieni la contrazione', 'Rilascia'],
        muscleGroup: 'spalle' as any,
        equipment: ['manubri'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        name: 'Cable lateral raise',
        description: 'Alzate laterali ai cavi',
        instructions: ['Accanto alla pulley bassa', 'Affitta la maniglia', 'Alza lateralmente', 'Scendi controllando'],
        muscleGroup: 'spalle' as any,
        equipment: ['cavi'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      // Braccia continuazione
      {
        name: 'Concentration curl',
        description: 'Curl concentrato',
        instructions: ['Seduto con gomito sulla coscia', 'Manubrio in mano', 'Alza contrando il bicipite', 'Scendi controllando'],
        muscleGroup: 'braccia' as any,
        equipment: ['manubri'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        name: 'Incline curl',
        description: 'Curl su panca inclinata',
        instructions: ['Seduto su panca inclinata', 'Manubri lungo i fianchi', 'Alza contrando i bicipiti', 'Scendi controllando'],
        muscleGroup: 'braccia' as any,
        equipment: ['manubri', 'panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        name: 'Tricep kickbacks',
        description: 'Estensioni tricipiti piegato',
        instructions: ['Piega in avanti con manubrio', 'Gomito flesso', 'Estendi il braccio', 'Ritorna controllando'],
        muscleGroup: 'braccia' as any,
        equipment: ['manubri'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        name: 'Overhead tricep extension',
        description: 'Estensioni tricipiti sopra la testa',
        instructions: ['In piedi con manubrio sopra la testa', 'Piega i gomiti', 'Estendi le braccia', 'Scendi controllando'],
        muscleGroup: 'braccia' as any,
        equipment: ['manubri'] as any,
        difficulty: 'intermedio' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      // Gambe continuazione
      {
        name: 'Front squat',
        description: 'Squat frontale',
        instructions: ['Bilanciere davanti alle spalle', 'Scendi piegando ginocchia e anche', 'Mantieni la schiena dritta', 'Spingi verso l\'alto'],
        muscleGroup: 'gambe' as any,
        equipment: ['bilanciere'] as any,
        difficulty: 'avanzato' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        name: 'Bulgarian split squat',
        description: 'Affondi bulgari',
        instructions: ['Un piede su panca dietro', 'Scendi con la gamba avanti', 'Tieni il busto dritto', 'Ritorna su'],
        muscleGroup: 'gambe' as any,
        equipment: ['panca'] as any,
        difficulty: 'intermedio' as any,
        category: 'forza' as any,
        isCustom: false
      },
      {
        name: 'Leg extensions',
        description: 'Estensioni gambe',
        instructions: ['Siediti sulla macchina', 'Piedi sotto i rulli', 'Estendi le gambe', 'Rilascia controllando'],
        muscleGroup: 'gambe' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        name: 'Leg curls',
        description: 'Curl femorali',
        instructions: ['Sdraiato sulla macchina', 'Gambe sotto i rulli', 'Piega le ginocchia', 'Rilascia controllando'],
        muscleGroup: 'gambe' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      // Core continuazione
      {
        name: 'Dead bug',
        description: 'Insetto morto',
        instructions: ['Sdraiato supino', 'Gambe e braccia sollevati', 'Abbassa alternativamente braccia e gambe', 'Mantieni la schiena a terra'],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'resistenza' as any,
        isCustom: false
      },
      {
        name: 'Bird dog',
        description: 'Cane uccello',
        instructions: ['Posizione quadrupedia', 'Estendi braccio e gamba opposti', 'Mantieni l\'equilibrio', 'Ritorna e cambia lato'],
        muscleGroup: 'core' as any,
        equipment: ['a corpo libero'] as any,
        difficulty: 'principiante' as any,
        category: 'equilibrio' as any,
        isCustom: false
      },
      {
        name: 'Hanging leg raises',
        description: 'Sollevamenti gambe sospesi',
        instructions: ['Appeso alla sbarra', 'Solleva le gambe tese', 'Scendi controllando', 'Mantieni il controllo'],
        muscleGroup: 'core' as any,
        equipment: ['sbarra'] as any,
        difficulty: 'avanzato' as any,
        category: 'ipertrofia' as any,
        isCustom: false
      },
      {
        name: 'Ab wheel rollout',
        description: 'Rotazione con ruota addominale',
        instructions: ['In ginocchio con ruota', 'Rotola in avanti', 'Torna controllando', 'Mantieni il core contratto'],
        muscleGroup: 'core' as any,
        equipment: ['ruota addominale'] as any,
        difficulty: 'intermedio' as any,
        category: 'resistenza' as any,
        isCustom: false
      },
      // Cardio continuazione
      {
        name: 'Battle ropes',
        description: 'Corde da battaglia',
        instructions: ['Afferra le corde', 'Crea onde con le braccia', 'Mantieni il ritmo', 'Esegui per tempo'],
        muscleGroup: 'cardio' as any,
        equipment: ['corde'] as any,
        difficulty: 'intermedio' as any,
        category: 'cardio' as any,
        isCustom: false
      },
      {
        name: 'Rowing machine',
        description: 'Vogatore',
        instructions: ['Siediti sul vogatore', 'Afferra la maniglia', 'Spingi con le gambe poi tira', 'Ritorna controllando'],
        muscleGroup: 'cardio' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'cardio' as any,
        isCustom: false
      },
      {
        name: 'Stair climber',
        description: 'Scala mobile',
        instructions: ['Sali sulla macchina', 'Salta i gradini', 'Mantieni la postura', 'Esegui per tempo'],
        muscleGroup: 'cardio' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'cardio' as any,
        isCustom: false
      },
      {
        name: ' elliptical trainer',
        description: 'Ellittica',
        instructions: ['Sali sulla macchina', 'Appoggia i piedi', 'Mantieni il ritmo', 'Esegui per tempo'],
        muscleGroup: 'cardio' as any,
        equipment: ['macchina'] as any,
        difficulty: 'principiante' as any,
        category: 'cardio' as any,
        isCustom: false
      }
    ];

    // Genera ID per tutti gli esercizi aggiuntivi
    const exercisesWithIds = additionalExercises.map((exercise, index) => ({
      ...exercise,
      id: (defaultExercises.length + index + 1).toString()
    }));

    await this.exercises.bulkAdd([...defaultExercises, ...exercisesWithIds]);
  }
}

export const db = new FitnessDatabase();