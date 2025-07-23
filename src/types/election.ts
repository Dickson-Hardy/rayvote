export interface Candidate {
  id: string;
  name: string;
  photo?: string;
  bio?: string;
}

export interface Position {
  id: string;
  title: string;
  candidates: Candidate[];
}

export interface Vote {
  positionId: string;
  candidateId: string;
}

export interface User {
  id: string;
  email: string;
  uniqueId: string;
  hasVoted: boolean;
}

export interface ElectionState {
  isOpen: boolean;
  positions: Position[];
  votes: Record<string, Record<string, number>>; // positionId -> candidateId -> count
}

export const ELECTION_POSITIONS: Position[] = [
  {
    id: 'president',
    title: 'President',
    candidates: [
      { id: 'raphael-iyama', name: 'Hon. Raphael Iyama' },
      { id: 'ogbaji-edor-raymond', name: 'Ogbaji Edor Raymond' }
    ]
  },
  {
    id: 'vice-president',
    title: 'Vice President',
    candidates: [
      { id: 'usman-ali', name: 'Usman Ali' },
      { id: 'osas', name: 'Osas' },
      { id: 'naomi', name: 'Naomi' }
    ]
  },
  {
    id: 'secretary',
    title: 'Secretary',
    candidates: [
      { id: 'sunday-dsp', name: 'Sunday DSP' },
      { id: 'blessing-ogbonna-obi', name: 'Blessing Ogbonna Obi' },
      { id: 'daddy-blinks', name: 'Daddy Blinks' }
    ]
  },
  {
    id: 'welfare-coordinator',
    title: 'Welfare/Event Coordinator',
    candidates: [
      { id: 'ali-idawor', name: 'Ali Idawor' },
      { id: 'esther-mukanche', name: 'Esther Mukanche' },
      { id: 'anthonia-acha', name: 'Anthonia Acha' }
    ]
  },
  {
    id: 'financial-secretary',
    title: 'Financial Secretary',
    candidates: [
      { id: 'godiya', name: 'Godiya' },
      { id: 'jethro', name: 'Jethro' },
      { id: 'patience-patrick', name: 'Patience Patrick' }
    ]
  },
  {
    id: 'pro',
    title: 'Public Relations Officer (PRO)',
    candidates: [
      { id: 'linus', name: 'Linus' },
      { id: 'oluchi-akpaka', name: 'Oluchi Akpaka' },
      { id: 'auwal-kabiru', name: 'Auwal Kabiru' }
    ]
  },
  {
    id: 'provost',
    title: 'Provost',
    candidates: [
      { id: 'george', name: 'George' },
      { id: 'austin-audu', name: 'Austin Audu' },
      { id: 'olokpo-godwin', name: 'Olokpo Godwin' }
    ]
  }
];