# Product Requirements Document (PRD)
## AI Kreativitetskonkurrence - Nine KickOff Bus Challenge

### 1. Oversigt

#### 1.1 Koncept
En "Mission Impossible"-inspireret team-konkurrence hvor hold på 4 personer konkurrerer om at anvende AI mest kreativt til at løse opgaver fra forskellige fagområder under busturen til KickOff.

#### 1.2 Formål
- Skabe engagement og teambuilding på tværs af faggrupper
- Demonstrere AI's kreative potentiale inden for alle Nine's arbejdsområder
- Gøre AI-erfaring sjov og konkurrencepræget
- Fremme tværfaglig forståelse og samarbejde

#### 1.3 Succeskriterier
- Høj engagement gennem hele busturen
- Kreative og innovative løsninger fra alle hold
- Positiv energi og "buzz" omkring AI efter turen
- Tværfaglige teams der arbejder godt sammen

### 2. Konkurrence Format

#### 2.1 Team Formation - Selvorganisering
- **Holdstørrelse**: 2-4 personer per hold (fleksibelt)
- **Selvorganisering**: Deltagere danner selv deres teams
- **Team oprettelse**: 
  - En person starter et nyt team og bliver captain
  - Giver teamet et navn
  - Tilføjer andre direkte fra "ledige deltagere" liste
- **Medlemskab**: En person kan kun være i ét team
- **Fleksibilitet**: Teams kan ændres når som helst
- **Start når I vil**: Ingen fælles starttid

#### 2.2 Team Management System
- **Ledige deltagere**: Liste over personer uden team
- **Team oversigt**: Se alle oprettede teams og medlemmer
- **Direkte tilføjelse**: Captain eller medlemmer kan tilføje ledige personer
- **Fjern medlem**: Captain kan fjerne medlemmer
- **Forlad team**: Medlemmer kan selv forlade team
- **Team størrelse**: Automatisk validering (min 2, max 4)

#### 2.2 Bedømmelseskriterier
**VIGTIGT**: Bedømmelse sker MANUELT efter busturen baseret på submissions

1. **Kreativitet** (40%)
   - Originale anvendelser af AI
   - Uventede løsninger
   - "Thinking outside the box"

2. **AI-udnyttelse** (30%)
   - Effektiv prompting
   - Udnyttelse af AI's styrker
   - Iterativ forbedring

3. **Præsentation** (20%)
   - Hvordan holdet har dokumenteret deres løsning
   - Klarhed i submission
   - Engagement i løsningen

4. **Samarbejde** (10%)
   - Evidens for at alle har bidraget
   - God arbejdsfordeling
   - Teamwork i løsningerne

### 3. Opgave Design

#### 3.1 Fagområder & Ansvarlige
1. **Test** (Ulrik)
2. **Projektledelse** (Jon)
3. **Backend** (Thor)
4. **Frontend** (Thomas B)
5. **Tilbud** (Line)
6. **Forretningsanalyse/EA** (Andreas)
7. **BUL/Salg** (Maria)
8. **Kommunikation/Branding** (Emma)

#### 3.2 Self-Paced Opgave System
- **Frit valg**: Teams vælger selv hvilke opgaver de vil løse
- **Én ad gangen**: Kun én aktiv opgave per team
- **Submit-to-proceed**: Skal aflevere før næste opgave kan vælges
- **Ingen eksklusivitet**: Alle teams kan lave samme opgaver
- **Strategisk element**: Teams kan vælge opgaver der passer deres styrker
- **Ingen låst rækkefølge**: Fleksibilitet i opgavevalg

#### 3.3 Opgave Karakteristika
- **Åbne opgaver**: Multiple løsninger mulige
- **Kreativt fokus**: Belønner innovation over korrekthed
- **Varieret sværhedsgrad**: Point baseret på kompleksitet
- **Estimeret tid**: 10-40 minutter per opgave
- **Smartphone-venlige**: Kan løses med mobil + AI

#### 3.4 Strategiske Elementer

**Opgave Valg**
- **Basis værdi**: Alle opgaver er ligeværdige
- **Kategori spredning**: Vælg fra forskellige fagområder
- **Sværhedsgrad**: Varieret fra let til svær
- **Team strategi**: Spil på styrker eller eksperimentér

**Focus på Process**
- Gem gode prompts
- Dokumentér iterations
- Vis hvordan I brugte AI kreativt
- Fremhæv teamwork i løsningerne

**Team Strategier**
- **Specialist**: Fokuser på fagområder hvor teamet har ekspertise
- **Generalist**: Løs opgaver fra alle kategorier for diversity bonus
- **Speed runner**: Tag de hurtige opgaver først
- **High risk/reward**: Gå efter de svære opgaver med høje point

#### 3.5 Eksempel Opgavetyper

**Test (Ulrik)**
- "Brug AI til at designe den mest kreative testcase for en dating-app for kæledyr"
- "Få AI til at generere de sjoveste edge-case scenarier for en elevator"

**Projektledelse (Jon)**
- "Lav verdens mest motiverende sprint retrospective format med AI"
- "Design en AI-assisteret metode til at håndtere svære stakeholders"

**Backend (Thor)**
- "Få AI til at forklare microservices gennem en madopskrift"
- "Design et API for tidsrejser - med fuld dokumentation"

**Frontend (Thomas B)**
- "Beskriv en UI for en app der kan læse tanker - med AI's hjælp"
- "Lav en CSS animation forklaret som en dans"

**Tilbud (Line)**
- "Skriv det mest overbevisende tilbud til Hogwarts' nye IT-system"
- "Lav en value proposition for en AI-butler til hunde"

**Forretningsanalyse/EA (Andreas)**
- "Map en forretningsproces for en virksomhed der sælger drømme"
- "Lav en enterprise arkitektur for Julemanden"

**BUL/Salg (Maria)**
- "Pitch AI-løsninger til en kunde fra 1850"
- "Sælg sand til en ørkenbeboer - med AI som sparringspartner"

**Kommunikation/Branding (Emma)**
- "Rebrand Nine som superhelte-organisation med AI"
- "Lav en viral kampagne for at gøre mandage populære"

### 4. Platform Specifikationer

#### 4.1 Teknisk Stack
- **Frontend**: Nuxt 3 med Vue 3 (TypeScript)
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Pinia (Nuxt 3 native)
- **Database**: SQL med Sequelize ORM
- **Real-time**: WebSockets via Nitro eller SSE
- **API**: Nitro server routes
- **Auth**: @sidebase/nuxt-auth med Google provider
- **Hosting**: Direkte server hosting (ingen CDN)
- **Device Support**: 
  - Mac (Safari, Chrome, Firefox)
  - iPad (Safari, Chrome)
  - Mobile (iOS Safari, Android Chrome)

#### 4.2 Responsive Design Requirements
- **Breakpoints** (Tailwind defaults):
  - Mobile: < 640px (sm)
  - iPad: 768px - 1024px (md-lg)
  - Desktop: 1024px+ (lg-xl)
- **Touch optimized**: Større buttons på mobile/iPad
- **Orientation**: Support både portrait og landscape
- **Assets**: Served direkte fra server

##### 4.1.1 Team Formation Phase
**Team Creation Flow**
1. **Login**: Google SSO authentication
2. **Choose Path**:
   - "Create New Team" → Bliver team captain
   - "Find Team" → Se eksisterende teams og ledige personer
   - "Wait to be Added" → Venter på at blive tilføjet til et team
3. **Team Setup** (for captains og medlemmer):
   - Vælg team navn (kreativt/sjovt encouraged)
   - Se liste over ledige medarbejdere
   - Klik på person for at tilføje til team (instant)
   - Personer tilføjes direkte uden godkendelse
4. **Team medlemmer kan**:
   - Også tilføje nye medlemmer (op til max 4)
   - Forlade team når som helst
   - Se alle team medlemmer
5. **Fleksibilitet**:
   - Kan ændre team når som helst
   - Ingen låsning eller godkendelser

**Employee List Management**
- **Visning**: Navn, rolle/titel, profilbillede (fra Google)
- **Filtrering**: Efter afdeling, rolle, søgning
- **Status indicators**:
  - Grøn: Ledig (kan tilføjes)
  - Blå: I team (viser teamnavn)
- **Real-time updates**: Liste opdateres instant når folk tilføjes/fjernes
- **One-click add**: Klik på ledig person = tilføjet til dit team

#### 6.2 Opgave System

##### 6.2.1 Task Selection Page
```vue
<!-- pages/tasks/index.vue -->
<template>
  <div class="container mx-auto px-4">
    <TeamStatus v-if="!canStartTasks" />
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <TaskCard 
        v-for="task in tasks" 
        :key="task.id"
        :task="task"
        :disabled="task.status === 'completed'"
        @click="selectTask(task)"
      />
    </div>
  </div>
</template>
```

##### 6.2.2 Task Workspace Page
```vue
<!-- pages/tasks/[id].vue -->
<template>
  <div class="flex flex-col lg:flex-row h-screen">
    <!-- Task Description -->
    <div class="lg:w-1/3 p-4 border-b lg:border-r">
      <TaskDescription :task="currentTask" />
      <div class="mt-4 space-y-2">
        <button @click="resetTask" class="btn-secondary">
          Reset Opgave
        </button>
        <button 
          @click="submitTask" 
          :disabled="!canSubmit"
          class="btn-primary"
        >
          Submit Finale Svar
        </button>
      </div>
    </div>
    
    <!-- AI Chat -->
    <div class="lg:w-2/3 flex flex-col">
      <ModelSelector v-model="selectedModel" />
      <AIChat 
        :entries="chatHistory"
        @delete="deleteEntry"
        @mark-final="toggleFinal"
      />
      <ChatInput @send="sendPrompt" />
    </div>
  </div>
</template>
```

##### 6.2.3 Component Examples
```typescript
// components/workspace/AIChat.vue
interface Props {
  entries: ChatEntry[]
}

interface Emits {
  (e: 'delete', id: string): void
  (e: 'mark-final', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
```

##### 4.1.3 Submission System
- **Multi-format**: Tekst (markdown supported)
- **AI conversation**: Gem udvalgte AI responses
- **Mark as final**: Markér hvilke AI-svar der er den endelige løsning
- **Draft saves**: Auto-gem undervejs
- **Team collaboration**: Alle kan bidrage til samme submission
- **Export ready**: Struktureret format for manuel bedømmelse

##### 4.1.4 AI Integration
- **Shared team chat**: Én AI-samtale per hold
- **Prompt history**: Se alle teamets prompts
- **Response saving**: Gem de bedste AI-svar
- **Token budget**: Fair usage per team

#### 4.2 Gamification Elements
- **Mission briefings**: Video/audio beskeder
- **Achievement badges**: "Most Creative", "Best Teamwork", etc.
- **Sound effects**: Mission Impossible tema
- **Progress bars**: Visual feedback
- **Surprise challenges**: Bonus opgaver

### 5. Detaljeret Opgave Flow

#### 5.1 Opgave Lifecycle
1. **Vælg Opgave** (kun hvis team har 2-4 medlemmer)
   - Browse tilgængelige opgaver
   - Se status: Available / In Progress / Completed
   - Klik for at starte

2. **Arbejd på Opgave**
   - Chat med 1-3 AI modeller
   - Skift mellem modeller
   - Slet individual prompts/svar
   - Reset hele opgaven og start forfra
   - Gem løbende (auto-save)

3. **Markér Finale Svar**
   - Vælg hvilke AI responses der er finale
   - Bekræft submission
   - Opgave låses permanent
   - Kan IKKE genåbnes eller ændres

4. **Næste Opgave**
   - Tilbage til opgave oversigt
   - Gennemførte opgaver er markeret
   - Vælg ny opgave

#### 5.2 Opgave Status Management
```typescript
enum TaskStatus {
  AVAILABLE = "available",      // Kan vælges
  IN_PROGRESS = "in_progress",  // Team arbejder på den
  COMPLETED = "completed"       // Låst med finale svar
}
```

#### 5.3 Chat Funktionalitet
- **Add prompt**: Skriv og send til valgt model
- **Delete entry**: Slet enkelt prompt/response par
- **Reset task**: Slet al chat historik og start forfra
- **Mark as final**: Vælg responses som finale svar
- **Lock on submit**: Efter finale svar = ingen ændringer

### 7. Teknisk Arkitektur

#### 7.1 Database Schema (Sequelize)
```typescript
// server/models/index.ts
import { Sequelize, DataTypes } from 'sequelize'

// Team Model
export const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  captainId: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

// User Model  
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING, // Google ID
    primaryKey: true
  },
  email: DataTypes.STRING,
  name: DataTypes.STRING,
  picture: DataTypes.STRING,
  role: DataTypes.STRING
})

// Task Model
export const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: DataTypes.STRING,
  category: DataTypes.STRING,
  description: DataTypes.TEXT,
  estimatedTime: DataTypes.INTEGER
})

// Submission Model
export const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  teamId: DataTypes.UUID,
  taskId: DataTypes.UUID,
  status: {
    type: DataTypes.ENUM('in_progress', 'completed'),
    defaultValue: 'in_progress'
  },
  chatHistory: DataTypes.JSON,
  finalAnswers: DataTypes.JSON,
  submittedAt: DataTypes.DATE
})

// Associations
Team.belongsToMany(User, { through: 'TeamMembers' })
User.belongsToMany(Team, { through: 'TeamMembers' })
Team.hasMany(Submission)
Task.hasMany(Submission)
```

#### 7.2 Nuxt 3 Server Routes
```typescript
// server/api/teams/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const team = await Team.create({
    name: body.name,
    captainId: body.captainId
  })
  return team
})

// server/api/teams/[id]/members.post.ts
export default defineEventHandler(async (event) => {
  const teamId = getRouterParam(event, 'id')
  const { userId } = await readBody(event)
  
  const team = await Team.findByPk(teamId)
  const user = await User.findByPk(userId)
  
  await team.addUser(user)
  return { success: true }
})
```

#### 7.3 Pinia Stores with Sequelize
```typescript
// stores/team.ts
export const useTeamStore = defineStore('team', () => {
  const currentTeam = ref<Team | null>(null)
  const availableUsers = ref<User[]>([])
  
  const fetchAvailableUsers = async () => {
    const { data } = await $fetch('/api/users/available')
    availableUsers.value = data
  }
  
  const createTeam = async (name: string) => {
    const { data } = await $fetch('/api/teams', {
      method: 'POST',
      body: { name, captainId: useAuth().data.value?.user?.id }
    })
    currentTeam.value = data
  }
  
  return { currentTeam, availableUsers, fetchAvailableUsers, createTeam }
})
```

##### 5.1.2 Opgave Pool
- **Total opgaver**: 40-50 (5-7 per fagområde)
- **Synlighed**: Alle opgaver synlige fra start
- **Filtrering**: Efter kategori, sværhedsgrad, point, status
- **Sortering**: Populære, nye, høje point, lav tid

#### 5.2 Webapp Struktur
```
Frontend (React/Vue)
├── Landing Page (Mission Brief)
├── Team Registration
├── Mission Dashboard
│   ├── Current Challenge
│   ├── AI Chat Interface
│   ├── Submission Form
│   └── Team Progress
├── Leaderboard
└── Admin Panel
    ├── Challenge Control
    ├── Scoring Interface
    └── Live Overview
```

#### 5.2 Real-time Features
- **WebSocket**: Live updates til alle teams
- **Synchronized timers**: Alle ser samme countdown
- **Push notifications**: Nye challenges, time warnings
- **Live leaderboard**: Instant point opdateringer

#### 5.3 Mobile Optimization
- **Touch-first design**: Store buttons, swipe gestures
- **Responsive layout**: Fungerer i portrait/landscape
- **Offline queue**: Gem submissions lokalt ved connection issues
- **Battery efficient**: Minimal background activity

#### 5.4 Infrastructure
- **Hosting**: Cloud platform (AWS/Azure/GCP)
- **CDN**: For static assets
- **Database**: 
  - PostgreSQL for team data
  - Redis for real-time status
- **Monitoring**: Real-time performance tracking
- **Backup**: Session data backup

### 6. Bruger Journey

#### 6.1 Team Formation Journey

##### For Team Creators
1. Log ind med Google
2. Klik "Opret nyt team"
3. Giv teamet et kreativt navn
4. Se liste over ledige kolleger
5. Klik på 1-3 personer for at tilføje dem
6. Start med opgaver med det samme

##### For Andre Deltagere
1. Log ind med Google
2. Tre muligheder:
   - Opret eget team
   - Vent på at blive tilføjet (status: ledig)
   - Se eksisterende teams og deres medlemmer
3. Hvis tilføjet til team: Notification + direkte adgang
4. Start med opgaver med teamet

##### For Spontane Team Builders
1. Log ind når som helst
2. Se hvem der er ledige
3. Tilføj dem direkte til dit team
4. Eller bliv tilføjet af andre
5. Juster team efter behov

#### 6.2 I Bussen
1. **Løbende start** (hele turen)
   - Folk logger ind når de vil
   - Danner teams organisk
   - Starter opgaver med det samme
   - Ingen fælles kickoff nødvendig

2. **Fleksibel deltagelse**
   - Teams kan udvides/ændres undervejs
   - Nye deltagere kan joine når som helst
   - Pausér og genoptag som det passer
   - Arbejd i eget tempo

3. **Konkurrence flow**
   - Vælg opgave
   - Vælg AI model (eller skift undervejs)
   - Løs med AI
   - Markér finale svar
   - Submit
   - Næste opgave
   - Fokus på kvalitet og kreativitet

4. **Data collection**
   - Alle submissions gemmes automatisk
   - AI conversations logges med model info
   - Real-time tilgængelig i admin interface

5. **Ved ankomst**
   - Stop for nye submissions
   - Dommere bedømmer via admin side
   - Præmier uddeles baseret på manuel vurdering

### 7. Admin Features

#### 7.1 Admin Bedømmelsesside (Simplified)
- **Adgang**: `/admin` route med auth protection
- **Submission List**: 
  - Tabel med alle teams og antal løste opgaver
  - Klik på team for detaljer
- **Team Detail View**:
  - Liste over løste opgaver
  - Klik på opgave for at se submission
- **Submission View**:
  - Team info
  - Opgave titel
  - Markerede finale svar
  - AI model brugt
  - Simpel note felt for dommere

#### 7.2 Basic Admin Interface
```vue
<!-- pages/admin/index.vue -->
<template>
  <div class="container mx-auto p-4">
    <h1>Bedømmelse</h1>
    <table class="w-full">
      <thead>
        <tr>
          <th>Team</th>
          <th>Medlemmer</th>
          <th>Løste opgaver</th>
          <th>Handling</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="team in teams" :key="team.id">
          <td>{{ team.name }}</td>
          <td>{{ team.members.length }}</td>
          <td>{{ team.completedTasks }}</td>
          <td>
            <NuxtLink :to="`/admin/team/${team.id}`">
              Se detaljer
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

#### 7.3 Monitoring (Under Turen)
- **Simple dashboard**: 
  - Antal aktive teams
  - Total løste opgaver
  - System status

### 8. Fordele ved Integreret Admin System

#### 8.1 Effektiv Bedømmelse
- **Alt i ét system**: Ingen export/import hassle
- **Real-time adgang**: Bedøm mens konkurrencen kører
- **Sammenligning**: Nemt at se forskellige teams' løsninger
- **Kontekst bevaret**: Se hele flowet inkl. model valg

#### 8.2 Multi-Model Fordele
- **Eksperimentering**: Teams kan teste forskellige AI'er
- **Læring**: Se hvilke modeller der fungerer bedst til hvad
- **Kreativitet**: Forskellige modeller giver forskellige perspektiver
- **Fairness**: Alle har samme muligheder

#### 8.3 Tekniske Fordele
- **Ingen data tab**: Alt gemmes direkte i systemet
- **Simplere arkitektur**: Én platform til alt
- **Bedre security**: Data forlader ikke systemet
- **Hurtigere bedømmelse**: Ingen ventetid på export

### 9. Risici & Mitigering

#### 8.1 Tekniske Udfordringer
- **Dårlig internet**: Offline mode, lokal caching
- **Device variation**: Extensive device testing
- **Overload**: Load balancing, CDN

#### 8.2 Bruger Udfordringer
- **AI erfaring**: Indbygget prompt hjælp
- **Team dynamics**: Facilitator guidelines
- **Tidspress**: Fleksible deadlines

### 10. Success Metrics

#### 10.1 Under Konkurrencen
- **Participation rate**: 95%+ aktiv deltagelse
- **Opgave coverage**: Alle opgaver forsøgt af mindst 2 teams
- **Completion rate**: Gennemsnit 5-8 opgaver per team
- **AI interactions**: 20+ prompts per team gennemsnit
- **Engagement time**: 90%+ af busturen

#### 10.2 Post-Event (Målt gennem manuel bedømmelse)
- **Kreativitets niveau**: Høj variation i løsninger
- **AI forståelse**: Evidens for god prompt engineering
- **Team collaboration**: Alle medlemmer har bidraget
- **Læring**: Nye AI use cases identificeret
- **Engagement**: Positive tilbagemeldinger

### 11. MVP Requirements

#### 10.1 Must Have
- Team registration & management
- 8-10 pre-designed challenges
- AI chat integration (GPT-4/Claude)
- Submission system
- Basic scoring interface
- Mobile responsive design
- Real-time updates

#### 10.2 Nice to Have
- Mission Impossible theming
- Sound effects & animations
- Advanced leaderboard
- Badge system
- Video briefings

#### 10.3 Post-MVP
- Results dashboard
- Best practices compilation
- Follow-up challenges
- Integration med Nine's systemer

### 11. Premie Struktur

#### 11.1 Hovedpræmie
- "Most Creative AI Team" - Stor præmie til vinderholdet

#### 11.2 Kategori Priser
- "Best Single Solution" - Mest kreative enkeltstående løsning
- "Best Teamwork" - Bedste samarbejde
- "Most Innovative Use of AI" - Mest innovative AI-anvendelse
- "People's Choice" - Afstemning blandt deltagere

### 13. Detaljerede Skærmbillede Specifikationer

#### 13.1 Login Side (/)
**Layout:**
- Centered container med max-width 400px
- Nine logo øverst (hvis tilgængelig)
- Overskrift: "AI Kreativitetskonkurrence"
- Undertekst: "Nine KickOff Bus Challenge"
- Google login knap (hvid med Google logo)
- Footer med "Powered by Nine"

**Styling:**
- Baggrund: Gradient eller solid brand farve
- Card design med shadow
- Padding: 2rem rundt om content
- Google button: Standard Google design guidelines

#### 13.2 Team Formation Side (/team)
**Layout:**
- To-column layout på desktop, stacked på mobile
- Venstre side: Team creation/status
- Højre side: Available members list

**Venstre Panel - No Team:**
- Overskrift: "Opret eller join et team"
- Input felt: "Team navn" (hvis creating)
- Button: "Opret Team" (primary color)
- Divider med "ELLER"
- Liste over eksisterende teams med "Join" button

**Venstre Panel - Has Team:**
- Team navn som overskrift
- Medlemsliste med profilbilleder og navne
- "Captain" badge ved team creator
- Member count: "3/4 medlemmer"
- Button: "Forlad Team" (rød/danger)
- Button: "Start Opgaver" (grøn, disabled hvis <2 medlemmer)

**Højre Panel:**
- Overskrift: "Ledige Deltagere"
- Søgefelt øverst
- Scrollable liste med:
  - Profilbillede (40x40px)
  - Navn
  - Titel/rolle
  - "Tilføj" button (blå)
- Ledige markeret med grøn prik
- I team markeret med grå tekst og team navn

#### 13.3 Opgave Oversigt (/tasks)
**Header:**
- Team navn og medlemmer (sticky header)
- Progress bar: "5 af 12 opgaver løst"
- "Log ud" link i højre hjørne

**Main Content:**
- Filter buttons: "Alle", "Test", "Backend", "Frontend", etc.
- Grid layout (3 columns desktop, 1 mobile)
- Opgave cards:
  - Kategori label (farvet badge)
  - Opgave titel (18px font)
  - Estimeret tid (ikon + "20 min")
  - Sværhedsgrad (1-3 stjerner)
  - Status overlay:
    - Grøn checkmark hvis completed
    - Orange spinner hvis in progress
    - Ingen overlay hvis available

**Card States:**
- Available: Hvid baggrund, hover effect
- In Progress: Orange border
- Completed: Grøn baggrund, ikke-klikkbar

#### 13.4 Opgave Workspace (/tasks/[id])
**Layout:**
- Split screen på desktop (30/70)
- Stacked på mobile (opgave øverst)

**Venstre Panel - Opgave Info:**
- Tilbage-pil og "Tilbage til opgaver"
- Kategori badge
- Opgave titel (24px bold)
- Beskrivelse (16px normal)
- Tips section (grå baggrund)
- Divider
- Button: "Reset Opgave" (orange, confirmation modal)
- Button: "Submit Finale Svar" (grøn, disabled hvis ingen markerede)

**Højre Panel - AI Chat:**
- Model selector (dropdown eller tabs)
  - "GPT-4", "Claude 3", "Gemini Pro"
  - Aktiv model highlighted
- Chat område (flex-grow, scrollable):
  - Prompt bubbles (højre side, blå)
  - AI responses (venstre side, grå)
  - Hver bubble har:
    - Tekst content
    - Tidsstempel (small, muted)
    - Delete ikon (hover visible)
    - Checkbox for "Markér som final"
  - Markerede finale svar har gul baggrund
- Input område (sticky bottom):
  - Textarea (auto-resize, max 5 lines)
  - Send button (blå pil)
  - Character counter

**Mobile Adjustments:**
- Opgave info som collapsible header
- Chat fylder hele skærmen
- Floating action button for submit

#### 13.5 Admin Dashboard (/admin)
**Authentication:**
- Redirect til login hvis ikke admin
- "Admin" badge i header

**Layout:**
- Simple tabel design
- Overskrift: "Bedømmelse - AI Konkurrence"
- Stats bar: "35 teams | 127 løste opgaver"

**Tabel:**
- Headers: Team | Medlemmer | Løste Opgaver | Handling
- Rows:
  - Team navn
  - Medlemmer count (e.g., "4")
  - Completed count (e.g., "7")
  - "Se detaljer" link (blå)
- Sortérbar på alle kolonner
- Pagination hvis >20 teams

#### 13.6 Admin Team Detail (/admin/team/[id])
**Header:**
- Tilbage link
- Team navn som overskrift
- Medlemsliste (comma separated)

**Opgave Liste:**
- Cards for hver løst opgave:
  - Opgave titel
  - Kategori badge
  - Tidsforbrug
  - "Se submission" button

#### 13.7 Admin Submission View (/admin/submission/[id])
**Layout:**
- Tilbage link
- Team og opgave info header

**Content:**
- Box med "Finale Svar":
  - AI model brugt
  - Markerede responses (gul baggrund)
  - Tidsstempel
- Note felt:
  - Label: "Bedømmelses noter"
  - Textarea (10 rows)
  - "Gem" button

**Responsive Design Notes:**
- Alle sider skal fungere på:
  - Desktop: 1200px+ (fuld layout)
  - iPad: 768px-1024px (adjusted spacing)
  - Mobile: <768px (stacked layout)
- Touch targets minimum 44x44px
- Font sizes: Base 16px, skalér med rems
- Padding/margins reduceres på mobile
- Modals: Full screen på mobile

**Farve Palette Forslag:**
- Primary: Nine brand farve eller blå
- Success: Grøn (#10B981)
- Warning: Orange (#F59E0B)
- Danger: Rød (#EF4444)
- Neutral: Grå skala (#F3F4F6 til #111827)
- Baggrund: Hvid eller meget lys grå

#### 12.1 Setup & Dependencies
```bash
# Setup
npx nuxi@latest init ai-competition-platform
cd ai-competition-platform

# Core dependencies
npm install @nuxtjs/tailwindcss @sidebase/nuxt-auth-next @pinia/nuxt
npm install sequelize mysql2  # eller pg for PostgreSQL
npm install --save-dev @types/sequelize

# Development
npm run dev
```

#### 12.2 Configuration
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    strict: true,
    typeCheck: true
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@sidebase/nuxt-auth',
    '@pinia/nuxt'
  ],
  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: 'authjs'
    }
  },
  nitro: {
    experimental: {
      websocket: true
    },
    plugins: ['~/server/plugins/database.ts']
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    claudeApiKey: process.env.CLAUDE_API_KEY,
    public: {
      authUrl: process.env.NEXTAUTH_URL
    }
  }
})
```

#### 12.3 Database Setup
```typescript
// server/plugins/database.ts
import { Sequelize } from 'sequelize'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  
  const sequelize = new Sequelize(config.databaseUrl, {
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production'
    }
  })
  
  // Import and sync models
  await sequelize.sync({ alter: true })
  
  console.log('Database connected')
})
```

### 13. Docker Compose Local Development Setup

#### 13.1 Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: nine-kickoff-db
    environment:
      POSTGRES_USER: nineuser
      POSTGRES_PASSWORD: ninepass
      POSTGRES_DB: kickoff_challenge
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nineuser -d kickoff_challenge"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for real-time features and caching
  redis:
    image: redis:7-alpine
    container_name: nine-kickoff-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Nuxt 3 Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nine-kickoff-app
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://nineuser:ninepass@postgres:5432/kickoff_challenge
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
      NUXT_PUBLIC_SITE_URL: http://localhost:3000
      # Auth
      AUTH_ORIGIN: http://localhost:3000
      AUTH_SECRET: your-auth-secret-here
      GOOGLE_CLIENT_ID: your-google-client-id
      GOOGLE_CLIENT_SECRET: your-google-client-secret
      # AI API Keys (replace with actual keys)
      OPENAI_API_KEY: your-openai-key
      CLAUDE_API_KEY: your-claude-key
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./:/app
      - /app/node_modules
      - /app/.nuxt
    command: npm run dev

  # Adminer for database management (optional)
  adminer:
    image: adminer:4
    container_name: nine-kickoff-adminer
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

#### 13.2 Dockerfile for Development
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
```

#### 13.3 Environment Configuration
```bash
# .env.example
# Database
DATABASE_URL=postgresql://nineuser:ninepass@localhost:5432/kickoff_challenge

# Redis
REDIS_URL=redis://localhost:6379

# Application
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# Authentication
AUTH_ORIGIN=http://localhost:3000
AUTH_SECRET=generate-a-secure-secret-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-anthropic-api-key

# Optional: Other AI providers
GEMINI_API_KEY=your-google-gemini-key
```

#### 13.4 Docker Compose Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v

# Rebuild app container after changes
docker-compose up -d --build app

# Access PostgreSQL CLI
docker-compose exec postgres psql -U nineuser -d kickoff_challenge

# Access Redis CLI
docker-compose exec redis redis-cli

# Run database migrations
docker-compose exec app npm run db:migrate

# Run database seed
docker-compose exec app npm run db:seed
```

#### 13.5 Development Workflow
```bash
# 1. Clone repository
git clone <repository-url>
cd nine-kickoff-bus-challenge

# 2. Copy environment file
cp .env.example .env
# Edit .env with your credentials

# 3. Start Docker services
docker-compose up -d

# 4. Install dependencies (if needed)
docker-compose exec app npm install

# 5. Run database migrations
docker-compose exec app npm run db:migrate

# 6. Seed initial data (challenges, etc.)
docker-compose exec app npm run db:seed

# 7. Access application
# Frontend: http://localhost:3000
# Adminer: http://localhost:8080
# API: http://localhost:3000/api
```

#### 13.6 Database Management Scripts
```json
// package.json additions
{
  "scripts": {
    "db:migrate": "node server/database/migrate.js",
    "db:seed": "node server/database/seed.js",
    "db:reset": "node server/database/reset.js",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f app",
    "docker:reset": "docker-compose down -v && docker-compose up -d"
  }
}
```

#### 13.7 Health Check Endpoint
```typescript
// server/api/health.get.ts
export default defineEventHandler(async (event) => {
  const checks = {
    app: true,
    database: false,
    redis: false
  }
  
  try {
    // Check database connection
    const sequelize = useSequelize()
    await sequelize.authenticate()
    checks.database = true
  } catch (error) {
    console.error('Database health check failed:', error)
  }
  
  try {
    // Check Redis connection
    const redis = useRedis()
    await redis.ping()
    checks.redis = true
  } catch (error) {
    console.error('Redis health check failed:', error)
  }
  
  const healthy = Object.values(checks).every(check => check === true)
  
  setResponseStatus(event, healthy ? 200 : 503)
  
  return {
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }
})
```

#### 13.8 Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: nine-kickoff-app
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      # Production environment variables
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    container_name: nine-kickoff-db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: nine-kickoff-redis
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```