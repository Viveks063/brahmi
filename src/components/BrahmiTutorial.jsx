import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Check, Book, PenTool, Scroll, Users, Globe, Clock, Star, Trophy, Target, Lock, Unlock, Volume2, Info, Lightbulb } from 'lucide-react';

// Comprehensive Brahmi Characters Database
const brahmiCharacters = {
  vowels: [
    { char: '𑀅', trans: 'a', meaning: 'vowel a', sound: '/a/', description: 'Short vowel A - fundamental vowel sound', example: 'Like "a" in "about"' },
    { char: '𑀆', trans: 'ā', meaning: 'long vowel aa', sound: '/aː/', description: 'Long vowel AA - extended A sound', example: 'Like "a" in "father"' },
    { char: '𑀇', trans: 'i', meaning: 'vowel i', sound: '/i/', description: 'Short vowel I', example: 'Like "i" in "bit"' },
    { char: '𑀈', trans: 'ī', meaning: 'long vowel ii', sound: '/iː/', description: 'Long vowel II - extended I sound', example: 'Like "ee" in "seen"' },
    { char: '𑀉', trans: 'u', meaning: 'vowel u', sound: '/u/', description: 'Short vowel U', example: 'Like "u" in "put"' },
    { char: '𑀊', trans: 'ū', meaning: 'long vowel uu', sound: '/uː/', description: 'Long vowel UU - extended U sound', example: 'Like "oo" in "moon"' },
    { char: '𑀋', trans: 'ṛ', meaning: 'vocalic r', sound: '/r̩/', description: 'Vocalic R - consonantal R used as vowel', example: 'Like "ri" in Sanskrit "kṛta"' },
    { char: '𑀌', trans: 'ṝ', meaning: 'long vocalic r', sound: '/r̩ː/', description: 'Long vocalic R', example: 'Extended vocalic R sound' },
    { char: '𑀍', trans: 'ḷ', meaning: 'vocalic l', sound: '/l̩/', description: 'Vocalic L - rare vowel', example: 'Consonantal L as vowel' },
    { char: '𑀎', trans: 'ḹ', meaning: 'long vocalic l', sound: '/l̩ː/', description: 'Long vocalic L - very rare', example: 'Extended vocalic L sound' },
    { char: '𑀏', trans: 'e', meaning: 'vowel e', sound: '/e/', description: 'Vowel E - mid front vowel', example: 'Like "e" in "hey"' },
    { char: '𑀐', trans: 'ai', meaning: 'diphthong ai', sound: '/ai/', description: 'Diphthong AI', example: 'Like "ai" in "aisle"' },
    { char: '𑀑', trans: 'o', meaning: 'vowel o', sound: '/o/', description: 'Vowel O - mid back vowel', example: 'Like "o" in "go"' },
    { char: '𑀒', trans: 'au', meaning: 'diphthong au', sound: '/au/', description: 'Diphthong AU', example: 'Like "ou" in "house"' },
  ],
  gutturals: [
    { char: '𑀓', trans: 'ka', meaning: 'consonant ka', sound: '/ka/', description: 'Voiceless velar stop', example: 'Like "k" in "kite"', series: 'Guttural (Ka-varga)' },
    { char: '𑀔', trans: 'kha', meaning: 'aspirated ka', sound: '/kʰa/', description: 'Aspirated voiceless velar stop', example: 'Like "kh" in "khaki"', series: 'Guttural (Ka-varga)' },
    { char: '𑀕', trans: 'ga', meaning: 'consonant ga', sound: '/ga/', description: 'Voiced velar stop', example: 'Like "g" in "go"', series: 'Guttural (Ka-varga)' },
    { char: '𑀖', trans: 'gha', meaning: 'aspirated ga', sound: '/gʰa/', description: 'Aspirated voiced velar stop', example: 'Like "gh" in "ghost"', series: 'Guttural (Ka-varga)' },
    { char: '𑀗', trans: 'ṅa', meaning: 'velar nasal', sound: '/ŋa/', description: 'Velar nasal consonant', example: 'Like "ng" in "sing"', series: 'Guttural (Ka-varga)' },
  ],
  palatals: [
    { char: '𑀘', trans: 'ca', meaning: 'consonant ca', sound: '/ca/', description: 'Voiceless palatal stop', example: 'Like "ch" in "church"', series: 'Palatal (Ca-varga)' },
    { char: '𑀙', trans: 'cha', meaning: 'aspirated ca', sound: '/cʰa/', description: 'Aspirated voiceless palatal stop', example: 'Like "chh"', series: 'Palatal (Ca-varga)' },
    { char: '𑀚', trans: 'ja', meaning: 'consonant ja', sound: '/ja/', description: 'Voiced palatal stop', example: 'Like "j" in "judge"', series: 'Palatal (Ca-varga)' },
    { char: '𑀛', trans: 'jha', meaning: 'aspirated ja', sound: '/jʰa/', description: 'Aspirated voiced palatal stop', example: 'Like "jh"', series: 'Palatal (Ca-varga)' },
    { char: '𑀜', trans: 'ña', meaning: 'palatal nasal', sound: '/ɲa/', description: 'Palatal nasal consonant', example: 'Like "ny" in "canyon"', series: 'Palatal (Ca-varga)' },
  ],
  cerebrals: [
    { char: '𑀝', trans: 'ṭa', meaning: 'retroflex ta', sound: '/ʈa/', description: 'Voiceless retroflex stop', example: 'Tongue curled back', series: 'Cerebral (Ṭa-varga)' },
    { char: '𑀞', trans: 'ṭha', meaning: 'aspirated ṭa', sound: '/ʈʰa/', description: 'Aspirated voiceless retroflex stop', example: 'Aspirated retroflex T', series: 'Cerebral (Ṭa-varga)' },
    { char: '𑀟', trans: 'ḍa', meaning: 'retroflex da', sound: '/ɖa/', description: 'Voiced retroflex stop', example: 'Voiced retroflex D', series: 'Cerebral (Ṭa-varga)' },
    { char: '𑀠', trans: 'ḍha', meaning: 'aspirated ḍa', sound: '/ɖʰa/', description: 'Aspirated voiced retroflex stop', example: 'Aspirated retroflex D', series: 'Cerebral (Ṭa-varga)' },
    { char: '𑀡', trans: 'ṇa', meaning: 'retroflex nasal', sound: '/ɳa/', description: 'Retroflex nasal consonant', example: 'Retroflex N sound', series: 'Cerebral (Ṭa-varga)' },
  ],
  dentals: [
    { char: '𑀢', trans: 'ta', meaning: 'dental ta', sound: '/t̪a/', description: 'Voiceless dental stop', example: 'Like "t" in "top"', series: 'Dental (Ta-varga)' },
    { char: '𑀣', trans: 'tha', meaning: 'aspirated ta', sound: '/t̪ʰa/', description: 'Aspirated voiceless dental stop', example: 'Like "th" in "think"', series: 'Dental (Ta-varga)' },
    { char: '𑀤', trans: 'da', meaning: 'dental da', sound: '/d̪a/', description: 'Voiced dental stop', example: 'Like "d" in "dog"', series: 'Dental (Ta-varga)' },
    { char: '𑀥', trans: 'dha', meaning: 'aspirated da', sound: '/d̪ʰa/', description: 'Aspirated voiced dental stop', example: 'Like "dh" in "dharma"', series: 'Dental (Ta-varga)' },
    { char: '𑀦', trans: 'na', meaning: 'dental nasal', sound: '/n̪a/', description: 'Dental nasal consonant', example: 'Like "n" in "name"', series: 'Dental (Ta-varga)' },
  ],
  labials: [
    { char: '𑀧', trans: 'pa', meaning: 'consonant pa', sound: '/pa/', description: 'Voiceless bilabial stop', example: 'Like "p" in "put"', series: 'Labial (Pa-varga)' },
    { char: '𑀨', trans: 'pha', meaning: 'aspirated pa', sound: '/pʰa/', description: 'Aspirated voiceless bilabial stop', example: 'Like "ph" in "phone"', series: 'Labial (Pa-varga)' },
    { char: '𑀩', trans: 'ba', meaning: 'consonant ba', sound: '/ba/', description: 'Voiced bilabial stop', example: 'Like "b" in "book"', series: 'Labial (Pa-varga)' },
    { char: '𑀪', trans: 'bha', meaning: 'aspirated ba', sound: '/bʰa/', description: 'Aspirated voiced bilabial stop', example: 'Like "bh" in "bhakti"', series: 'Labial (Pa-varga)' },
    { char: '𑀫', trans: 'ma', meaning: 'bilabial nasal', sound: '/ma/', description: 'Bilabial nasal consonant', example: 'Like "m" in "mother"', series: 'Labial (Pa-varga)' },
  ],
  semivowels: [
    { char: '𑀬', trans: 'ya', meaning: 'semivowel ya', sound: '/ja/', description: 'Palatal approximant', example: 'Like "y" in "yes"', series: 'Semivowels' },
    { char: '𑀭', trans: 'ra', meaning: 'semivowel ra', sound: '/ra/', description: 'Alveolar trill or tap', example: 'Like "r" in "red"', series: 'Semivowels' },
    { char: '𑀮', trans: 'la', meaning: 'semivowel la', sound: '/la/', description: 'Lateral approximant', example: 'Like "l" in "love"', series: 'Semivowels' },
    { char: '𑀯', trans: 'va', meaning: 'semivowel va', sound: '/ʋa/', description: 'Labiodental approximant', example: 'Like "v" in "very"', series: 'Semivowels' },
  ],
  sibilants: [
    { char: '𑀰', trans: 'śa', meaning: 'palatal sibilant', sound: '/ʃa/', description: 'Voiceless palatal fricative', example: 'Like "sh" in "ship"', series: 'Sibilants' },
    { char: '𑀱', trans: 'ṣa', meaning: 'retroflex sibilant', sound: '/ʂa/', description: 'Voiceless retroflex fricative', example: 'Retroflex "sh" sound', series: 'Sibilants' },
    { char: '𑀲', trans: 'sa', meaning: 'dental sibilant', sound: '/sa/', description: 'Voiceless alveolar fricative', example: 'Like "s" in "sun"', series: 'Sibilants' },
    { char: '𑀳', trans: 'ha', meaning: 'glottal fricative', sound: '/ha/', description: 'Voiceless glottal fricative', example: 'Like "h" in "hello"', series: 'Aspirate' },
  ],
  numerals: [
    { char: '𑁦', trans: '1', meaning: 'numeral one', sound: 'eka', description: 'Number 1 in Brahmi', example: 'One unit', series: 'Numbers' },
    { char: '𑁧', trans: '2', meaning: 'numeral two', sound: 'dvi', description: 'Number 2 in Brahmi', example: 'Two units', series: 'Numbers' },
    { char: '𑁨', trans: '3', meaning: 'numeral three', sound: 'tri', description: 'Number 3 in Brahmi', example: 'Three units', series: 'Numbers' },
    { char: '𑁩', trans: '4', meaning: 'numeral four', sound: 'catur', description: 'Number 4 in Brahmi', example: 'Four units', series: 'Numbers' },
    { char: '𑁪', trans: '5', meaning: 'numeral five', sound: 'pañca', description: 'Number 5 in Brahmi', example: 'Five units', series: 'Numbers' },
    { char: '𑁫', trans: '6', meaning: 'numeral six', sound: 'ṣaṭ', description: 'Number 6 in Brahmi', example: 'Six units', series: 'Numbers' },
    { char: '𑁬', trans: '7', meaning: 'numeral seven', sound: 'sapta', description: 'Number 7 in Brahmi', example: 'Seven units', series: 'Numbers' },
    { char: '𑁭', trans: '8', meaning: 'numeral eight', sound: 'aṣṭa', description: 'Number 8 in Brahmi', example: 'Eight units', series: 'Numbers' },
    { char: '𑁮', trans: '9', meaning: 'numeral nine', sound: 'nava', description: 'Number 9 in Brahmi', example: 'Nine units', series: 'Numbers' },
    { char: '𑁦𑁦', trans: '10', meaning: 'numeral ten', sound: 'daśa', description: 'Number 10 in Brahmi', example: 'Ten units', series: 'Numbers' },
  ]
};

// Comprehensive lesson structure
const lessons = [
  { id: 1, title: 'Introduction to Brahmi Script', type: 'intro', data: null, unlocked: true, category: 'History' },
  { id: 2, title: 'Historical Context & Origins', type: 'history', data: null, unlocked: false, category: 'History' },
  { id: 3, title: 'Brahmi vs Modern Scripts', type: 'comparison', data: null, unlocked: false, category: 'History' },
  { id: 4, title: 'Basic Vowels (a, ā, i, ī)', type: 'learn', data: brahmiCharacters.vowels.slice(0, 4), unlocked: false, category: 'Vowels' },
  { id: 5, title: 'Mid Vowels (u, ū, ṛ, ṝ)', type: 'learn', data: brahmiCharacters.vowels.slice(4, 8), unlocked: false, category: 'Vowels' },
  { id: 6, title: 'Complex Vowels (ḷ, ḹ, e, ai)', type: 'learn', data: brahmiCharacters.vowels.slice(8, 12), unlocked: false, category: 'Vowels' },
  { id: 7, title: 'Final Vowels (o, au)', type: 'learn', data: brahmiCharacters.vowels.slice(12), unlocked: false, category: 'Vowels' },
  { id: 8, title: 'Vowel Tracing Practice', type: 'trace', data: brahmiCharacters.vowels.slice(0, 8), unlocked: false, category: 'Vowels' },
  { id: 9, title: 'Ka-varga (Gutturals)', type: 'learn', data: brahmiCharacters.gutturals, unlocked: false, category: 'Consonants' },
  { id: 10, title: 'Ca-varga (Palatals)', type: 'learn', data: brahmiCharacters.palatals, unlocked: false, category: 'Consonants' },
  { id: 11, title: 'Ṭa-varga (Cerebrals)', type: 'learn', data: brahmiCharacters.cerebrals, unlocked: false, category: 'Consonants' },
  { id: 12, title: 'Ta-varga (Dentals)', type: 'learn', data: brahmiCharacters.dentals, unlocked: false, category: 'Consonants' },
  { id: 13, title: 'Pa-varga (Labials)', type: 'learn', data: brahmiCharacters.labials, unlocked: false, category: 'Consonants' },
  { id: 14, title: 'Semivowels (ya, ra, la, va)', type: 'learn', data: brahmiCharacters.semivowels, unlocked: false, category: 'Consonants' },
  { id: 15, title: 'Sibilants & Aspirate', type: 'learn', data: brahmiCharacters.sibilants, unlocked: false, category: 'Consonants' },
  { id: 16, title: 'Guttural Tracing', type: 'trace', data: brahmiCharacters.gutturals, unlocked: false, category: 'Practice' },
  { id: 17, title: 'Palatal Tracing', type: 'trace', data: brahmiCharacters.palatals, unlocked: false, category: 'Practice' },
  { id: 18, title: 'Dental & Cerebral Tracing', type: 'trace', data: [...brahmiCharacters.cerebrals, ...brahmiCharacters.dentals], unlocked: false, category: 'Practice' },
  { id: 19, title: 'Labial & Semivowel Tracing', type: 'trace', data: [...brahmiCharacters.labials, ...brahmiCharacters.semivowels], unlocked: false, category: 'Practice' },
  { id: 20, title: 'Brahmi Numerals', type: 'learn', data: brahmiCharacters.numerals, unlocked: false, category: 'Numbers' },
  { id: 21, title: 'Number Tracing', type: 'trace', data: brahmiCharacters.numerals.slice(0, 9), unlocked: false, category: 'Numbers' },
  { id: 22, title: 'Complete Character Review', type: 'review', data: null, unlocked: false, category: 'Review' },
  { id: 23, title: 'Reading Ancient Inscriptions', type: 'reading', data: null, unlocked: false, category: 'Advanced' },
  { id: 24, title: 'Brahmi in Different Regions', type: 'regional', data: null, unlocked: false, category: 'Advanced' },
];

const BrahmiTutorial = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [currentView, setCurrentView] = useState('home');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [userProgress, setUserProgress] = useState({
    completedLessons: [],
    currentStreak: 0,
    totalPoints: 0,
    unlockedLessons: [1]
  });
  
  const [lessonProgress, setLessonProgress] = useState({
    currentIndex: 0,
    viewedItems: []
  });

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ✅ LOAD on first mount ONLY
  useEffect(() => {
    const savedProgress = localStorage.getItem('brahmiProgress');
    const savedLessonProgress = localStorage.getItem('brahmiLessonProgress');
    
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    if (savedLessonProgress) {
      setLessonProgress(JSON.parse(savedLessonProgress));
    }
    
    setIsLoaded(true);
  }, []); // Empty dependency = runs once on mount

  // ✅ SAVE whenever progress changes (but only after loaded)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('brahmiProgress', JSON.stringify(userProgress));
    }
  }, [userProgress, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('brahmiLessonProgress', JSON.stringify(lessonProgress));
    }
  }, [lessonProgress, isLoaded]);
  

  const categories = ['All', 'History', 'Vowels', 'Consonants', 'Practice', 'Numbers', 'Review', 'Advanced'];

  const filteredLessons = selectedCategory === 'All' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === selectedCategory);

  const HomeDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12 mt-20">
          <h1 className="text-5xl font-bold text-amber-800 mb-4">Ancient Brahmi Script Mastery</h1>
          <p className="text-xl text-amber-700 max-w-3xl mx-auto">
            Master the ancient script that gave birth to most Indian writing systems. 
            Learn 50+ characters, historical context, and practical application.
          </p>
        </header>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-amber-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Trophy className="w-10 h-10 text-yellow-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Progress</h3>
            </div>
            <p className="text-4xl font-bold text-amber-600">{userProgress.completedLessons.length}</p>
            <p className="text-gray-600">/ {lessons.length} Lessons</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(userProgress.completedLessons.length / lessons.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Star className="w-10 h-10 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Points</h3>
            </div>
            <p className="text-4xl font-bold text-orange-600">{userProgress.totalPoints}</p>
            <p className="text-gray-600">Total Score</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Target className="w-10 h-10 text-red-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Streak</h3>
            </div>
            <p className="text-4xl font-bold text-red-600">{userProgress.currentStreak}</p>
            <p className="text-gray-600">Days</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Scroll className="w-10 h-10 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Characters</h3>
            </div>
            <p className="text-4xl font-bold text-green-600">50+</p>
            <p className="text-gray-600">Total Available</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLessons.map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>
    </div>
  );

  const LessonCard = ({ lesson }) => {
    const isUnlocked = userProgress.unlockedLessons.includes(lesson.id);
    const isCompleted = userProgress.completedLessons.includes(lesson.id);
    
    const getIcon = () => {
      switch(lesson.type) {
        case 'intro': return <Info className="w-6 h-6" />;
        case 'history': return <Clock className="w-6 h-6" />;
        case 'comparison': return <Globe className="w-6 h-6" />;
        case 'learn': return <Book className="w-6 h-6" />;
        case 'trace': return <PenTool className="w-6 h-6" />;
        case 'review': return <Target className="w-6 h-6" />;
        case 'reading': return <Scroll className="w-6 h-6" />;
        case 'regional': return <Users className="w-6 h-6" />;
        default: return <Book className="w-6 h-6" />;
      }
    };

    const getCategoryColor = () => {
      switch(lesson.category) {
        case 'History': return 'border-blue-200 hover:border-blue-300';
        case 'Vowels': return 'border-green-200 hover:border-green-300';
        case 'Consonants': return 'border-purple-200 hover:border-purple-300';
        case 'Practice': return 'border-orange-200 hover:border-orange-300';
        case 'Numbers': return 'border-red-200 hover:border-red-300';
        case 'Review': return 'border-yellow-200 hover:border-yellow-300';
        case 'Advanced': return 'border-indigo-200 hover:border-indigo-300';
        default: return 'border-gray-200 hover:border-gray-300';
      }
    };

    return (
      <div 
        className={`bg-white rounded-lg p-4 shadow-lg border-2 cursor-pointer transition-all duration-300 ${
          isUnlocked 
            ? `${getCategoryColor()} hover:shadow-xl` 
            : 'border-gray-200 opacity-60'
        } ${isCompleted ? 'bg-green-50' : ''}`}
        onClick={() => isUnlocked && startLesson(lesson)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {getIcon()}
            <span className="ml-2 font-semibold text-gray-800 text-sm">{lesson.title}</span>
          </div>
          {isUnlocked ? (
            isCompleted ? <Check className="w-5 h-5 text-green-500" /> : <Unlock className="w-5 h-5 text-amber-500" />
          ) : (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 capitalize">{lesson.type}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{lesson.category}</span>
        </div>
        {lesson.data && (
          <p className="text-xs text-gray-600 mt-1">{lesson.data.length} characters</p>
        )}
      </div>
    );
  };

  const startLesson = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentView('lesson');
    setLessonProgress({ currentIndex: 0, viewedItems: [] });
  };

  const IntroductionMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 pt-24">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Home
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-4">Welcome to Ancient Brahmi Script</h1>
          <div className="text-6xl mb-6">𑀅𑀦𑁄𑀓𑁆𑀭𑀫</div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Brahmi is the ancestor of most writing systems used in India and Southeast Asia today. 
            Dating back to the 3rd century BCE, it was used to write the edicts of Emperor Ashoka 
            and numerous ancient inscriptions across the Indian subcontinent.
          </p>
        </div>

        // ... continuing from IntroductionMode

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-amber-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Historical Timeline
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li><strong>3rd century BCE:</strong> Earliest Brahmi inscriptions</li>
              <li><strong>273-232 BCE:</strong> Ashoka's edicts in Brahmi</li>
              <li><strong>1st century CE:</strong> Peak usage period</li>
              <li><strong>4th century CE:</strong> Evolution into regional scripts</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2" />
              Geographic Spread
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li><strong>India:</strong> Across the entire subcontinent</li>
              <li><strong>Sri Lanka:</strong> Buddhist inscriptions</li>
              <li><strong>Southeast Asia:</strong> Trade and Buddhist influence</li>
              <li><strong>Central Asia:</strong> Along the Silk Road</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2" />
            Why Learn Brahmi?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-gray-700">
            <div>
              <h4 className="font-medium mb-2">Historical Understanding</h4>
              <p className="text-sm">Read original ancient texts and inscriptions directly</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Script Evolution</h4>
              <p className="text-sm">Understand how modern Indian scripts developed</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Cultural Heritage</h4>
              <p className="text-sm">Connect with India's rich literary and cultural past</p>
            </div>
          </div>
        </div>

        <div className="text-center pb-8">
          <button
            onClick={() => completeLesson()}
            className="px-8 py-4 bg-amber-600 text-white text-lg font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-lg"
          >
            Begin Learning Journey
          </button>
        </div>
      </div>
    </div>
  );

  const HistoryMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 pt-24">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Home
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-6">Historical Context & Origins</h1>
          
          <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
            <div className="bg-amber-50 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-amber-800 mb-4">Discovery and Decipherment</h3>
              <p>
                The Brahmi script was deciphered in 1837 by James Prinsep, a British scholar and antiquary. 
                The breakthrough came through the bilingual coins of Indo-Greek kings and the rock edicts of Emperor Ashoka. 
                Prinsep's work opened up centuries of Indian history that had been locked away in stone inscriptions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Emperor Ashoka's Role</h3>
                <p className="text-sm">
                  Emperor Ashoka (304-232 BCE) used Brahmi script extensively for his edicts, 
                  which were carved on rocks and pillars across his empire. These edicts, 
                  written in Prakrit language using Brahmi script, spread Buddhist teachings 
                  and administrative policies.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-3">Archaeological Evidence</h3>
                <p className="text-sm">
                  Over 1,200 Brahmi inscriptions have been discovered across South Asia, 
                  ranging from simple name labels on pottery to elaborate royal proclamations. 
                  The script shows remarkable consistency across vast geographical distances.
                </p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-purple-800 mb-4">Evolution Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🏺</div>
                  <div>
                    <h4 className="font-semibold">Early Period (3rd-1st century BCE)</h4>
                    <p className="text-sm">Ashoka's edicts, cave inscriptions at Karla and Bhaja</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">⛩️</div>
                  <div>
                    <h4 className="font-semibold">Middle Period (1st-3rd century CE)</h4>
                    <p className="text-sm">Kushan inscriptions, Buddhist monastery records</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📜</div>
                  <div>
                    <h4 className="font-semibold">Late Period (3rd-5th century CE)</h4>
                    <p className="text-sm">Gupta inscriptions, evolution into regional scripts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pb-8">
          <button
            onClick={() => completeLesson()}
            className="px-8 py-4 bg-amber-600 text-white text-lg font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-lg"
          >
            Continue to Script Comparison
          </button>
        </div>
      </div>
    </div>
  );

  const LearnMode = () => {
    const character = currentLesson.data[lessonProgress.currentIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 pt-24">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => setCurrentView('home')}
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Home
            </button>
            <div className="text-sm text-gray-500">
              {lessonProgress.currentIndex + 1} / {currentLesson.data.length}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="bg-amber-50 rounded-2xl p-8 mb-6">
                <div className="text-9xl font-bold text-amber-700 mb-4">{character.char}</div>
                <div className="text-3xl font-semibold text-gray-800 mb-2">{character.trans}</div>
                <div className="text-lg text-amber-600 font-mono">{character.sound}</div>
              </div>
              
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">{character.meaning}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{character.description}</p>
              </div>

              {character.example && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Pronunciation Example:</h4>
                  <p className="text-green-700">{character.example}</p>
                </div>
              )}

              {character.series && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Character Series:</h4>
                  <p className="text-blue-700">{character.series}</p>
                </div>
              )}

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Memory Tip:</h4>
                <p className="text-yellow-700">{getMemoryTip(character)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-12">
            <button
              onClick={() => setLessonProgress(prev => ({ ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) }))}
              disabled={lessonProgress.currentIndex === 0}
              className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>
            
            <button
              onClick={() => {
                if (lessonProgress.currentIndex < currentLesson.data.length - 1) {
                  setLessonProgress(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
                } else {
                  completeLesson();
                }
              }}
              className="flex items-center px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              {lessonProgress.currentIndex === currentLesson.data.length - 1 ? 'Complete Lesson' : 'Next Character'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TracingMode = () => {
    const character = currentLesson.data[lessonProgress.currentIndex];
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 6;
      }
    }, []);

    const startDrawing = (e) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 pt-24">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => setCurrentView('home')}
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Home
            </button>
            <div className="text-sm text-gray-500">
              {lessonProgress.currentIndex + 1} / {currentLesson.data.length}
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">Practice Writing: {character.trans}</h2>
            <p className="text-gray-600">{character.meaning}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <div className="bg-amber-50 rounded-xl p-6 mb-4">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">Reference</h3>
                <div className="text-8xl font-bold text-amber-700 mb-2">{character.char}</div>
                <p className="text-lg text-gray-600">{character.trans}</p>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Practice Here</h3>
              <div className="relative inline-block">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="border-2 border-amber-300 rounded-xl cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="text-6xl text-amber-200 opacity-50">{character.char}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Tracing Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Follow the natural stroke order</li>
                  <li>• Start from top-left when possible</li>
                  <li>• Maintain consistent thickness</li>
                  <li>• Take your time for accuracy</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Character Info:</h4>
                <p className="text-sm text-green-700">{character.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={clearCanvas}
              className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Canvas
            </button>

            <button
              onClick={() => setLessonProgress(prev => ({ ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) }))}
              disabled={lessonProgress.currentIndex === 0}
              className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>
            
            <button
              onClick={() => {
                if (lessonProgress.currentIndex < currentLesson.data.length - 1) {
                  setLessonProgress(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
                  clearCanvas();
                } else {
                  completeLesson();
                }
              }}
              className="flex items-center px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              {lessonProgress.currentIndex === currentLesson.data.length - 1 ? 'Complete Practice' : 'Next Character'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getMemoryTip = (character) => {
    const tips = {
      'a': 'Think of it as an arrow pointing right - the first and most basic vowel',
      'ā': 'Like the short "a" but with a horizontal line extending the sound',
      'ka': 'Resembles a bird in flight - remember "ka" like a crow cawing',
      'ga': 'Has a rounded top like a pot (ghada in Hindi starts with ga)',
      'na': 'The curved bottom resembles a nose - "na" for nose',
      'ma': 'Think of it as a mother\'s embrace with curved arms',
      'ya': 'Looks like a person doing yoga - "ya" for yoga',
      'ra': 'Has angular strokes like rays of sun - "ra" for rays'
    };
    return tips[character.trans] || `Practice writing "${character.trans}" by focusing on its unique shape and stroke pattern.`;
  };

  const completeLesson = () => {
    const points = 50 + (currentLesson.data?.length * 5 || 0);
    setUserProgress(prev => ({
      ...prev,
      completedLessons: [...prev.completedLessons, currentLesson.id],
      totalPoints: prev.totalPoints + points,
      unlockedLessons: [...prev.unlockedLessons, currentLesson.id + 1]
    }));
    setCurrentView('home');
  };

  const renderCurrentView = () => {
    if (currentView === 'home') return <HomeDashboard />;
    
    if (currentView === 'lesson' && currentLesson) {
      switch (currentLesson.type) {
        case 'intro': return <IntroductionMode />;
        case 'history': return <HistoryMode />;
        case 'learn': return <LearnMode />;
        case 'trace': return <TracingMode />;
        default: return <IntroductionMode />;
      }
    }
    
    return <HomeDashboard />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {renderCurrentView()}
    </div>
  );
};

export default BrahmiTutorial;