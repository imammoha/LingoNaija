import { useEffect, useState } from 'react'

const API = 'http://127.0.0.1:8000/api'

async function getJson(url, options = {}) {
  const response = await fetch(url, options)

  const contentType =
    response.headers.get('content-type') || ''

  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.detail
        ? data.detail
        : 'Something went wrong'

    throw new Error(message)
  }

  return data
}

function App() {
  const [page, setPage] = useState('home')

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lingonaija_user')

    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [mobileMenu, setMobileMenu] = useState(false)

  const [languages, setLanguages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState('hausa')

  const [dictionary, setDictionary] = useState([])
  const [dictionarySearch, setDictionarySearch] = useState('')
  const [dictionaryLoading, setDictionaryLoading] =
    useState(false)

  const [lessons, setLessons] = useState([])
  const [lessonsLoading, setLessonsLoading] =
    useState(false)

  const [selectedLesson, setSelectedLesson] =
    useState(null)

  const [currentQuestion, setCurrentQuestion] =
    useState(0)

  const [quizScore, setQuizScore] = useState(0)
  const [quizFinished, setQuizFinished] =
    useState(false)

  const [xp, setXp] = useState(() => {
    return Number(
      localStorage.getItem('lingonaija_xp') || 0
    )
  })

  const [streak, setStreak] = useState(() => {
    return Number(
      localStorage.getItem('lingonaija_streak') || 0
    )
  })

  const [completedLessons, setCompletedLessons] =
    useState(() => {
      return Number(
        localStorage.getItem(
          'lingonaija_completed_lessons'
        ) || 0
      )
    })

  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [authLoading, setAuthLoading] =
    useState(false)

  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] =
    useState('')

  const [progressData, setProgressData] =
    useState(null)

  useEffect(() => {
    loadLanguages()
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'lingonaija_xp',
      xp.toString()
    )
  }, [xp])

  useEffect(() => {
    localStorage.setItem(
      'lingonaija_streak',
      streak.toString()
    )
  }, [streak])

  useEffect(() => {
    localStorage.setItem(
      'lingonaija_completed_lessons',
      completedLessons.toString()
    )
  }, [completedLessons])

  useEffect(() => {
    if (page === 'dictionary') {
      loadDictionary(selectedLanguage)
    }

    if (page === 'lessons') {
      loadLessons(selectedLanguage)
    }

    if (page === 'progress' && user) {
      loadProgress()
    }
  }, [page, selectedLanguage, user])

  async function loadLanguages() {
    try {
      const data = await getJson(
        `${API}/languages`
      )

      setLanguages(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(
        'Could not load languages:',
        error
      )
    }
  }

  async function loadDictionary(languageCode) {
    setDictionaryLoading(true)

    try {
      const data = await getJson(
        `${API}/dictionary/${languageCode}`
      )

      setDictionary(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(
        'Could not load dictionary:',
        error
      )

      setDictionary([])
    } finally {
      setDictionaryLoading(false)
    }
  }

  async function loadLessons(languageCode) {
    setLessonsLoading(true)

    try {
      const data = await getJson(
        `${API}/lessons/${languageCode}`
      )

      setLessons(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(
        'Could not load lessons:',
        error
      )

      setLessons([])
    } finally {
      setLessonsLoading(false)
    }
  }

  async function loadProgress() {
    if (!user) return

    try {
      const data = await getJson(
        `${API}/progress/${user.id}`
      )

      setProgressData(data)
    } catch (error) {
      console.error(
        'Could not load progress:',
        error
      )
    }
  }

  function navigateTo(destination) {
    setPage(destination)
    setMobileMenu(false)
    setAuthError('')
    setAuthMessage('')
  }

  function chooseLanguage(languageCode) {
    setSelectedLanguage(languageCode)
  }

  function startLesson(lesson) {
    if (!lesson) {
      return
    }

    setSelectedLesson(lesson)
    setCurrentQuestion(0)
    setQuizScore(0)
    setQuizFinished(false)
    setPage('quiz')
  }

  function goBackToLessons() {
    setSelectedLesson(null)
    setCurrentQuestion(0)
    setQuizScore(0)
    setQuizFinished(false)
    setPage('lessons')
  }

  function logout() {
    localStorage.removeItem(
      'lingonaija_user'
    )

    setUser(null)
    setPage('home')
    setMobileMenu(false)
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()

    setAuthError('')
    setAuthMessage('')
    setAuthLoading(true)

    const isRegister = page === 'register'

    try {
      const endpoint = isRegister
        ? `${API}/auth/register`
        : `${API}/auth/login`

      const body = isRegister
        ? {
            username: authForm.username,
            email: authForm.email,
            password: authForm.password,
          }
        : {
            email: authForm.email,
            password: authForm.password,
          }

      const data = await getJson(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const loggedInUser =
        isRegister
          ? data
          : data.user

      setUser(loggedInUser)

      localStorage.setItem(
        'lingonaija_user',
        JSON.stringify(loggedInUser)
      )

      setAuthForm({
        username: '',
        email: '',
        password: '',
      })

      setAuthMessage(
        isRegister
          ? 'Account created successfully.'
          : 'Login successful.'
      )

      setPage('home')
    } catch (error) {
      console.error(error)

      setAuthError(
        error.message ||
          'Authentication failed.'
      )
    } finally {
      setAuthLoading(false)
    }
  }

  function handleAuthChange(event) {
    const { name, value } = event.target

    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function renderHeader() {
    return (
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl font-black text-white">
              L
            </div>

            <div className="text-left">
              <div className="text-lg font-extrabold text-slate-900">
                LingoNaija
              </div>

              <div className="text-xs text-slate-500">
                Learn languages
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            <button
              onClick={() => navigateTo('home')}
              className="font-semibold text-slate-700 hover:text-green-600"
            >
              Home
            </button>

            <button
              onClick={() =>
                navigateTo('dictionary')
              }
              className="font-semibold text-slate-700 hover:text-green-600"
            >
              Dictionary
            </button>

            <button
              onClick={() =>
                navigateTo('lessons')
              }
              className="font-semibold text-slate-700 hover:text-green-600"
            >
              Lessons
            </button>

            {user && (
              <button
                onClick={() =>
                  navigateTo('progress')
                }
                className="font-semibold text-slate-700 hover:text-green-600"
              >
                Progress
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                  {user.username}
                </div>

                <button
                  onClick={logout}
                  className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigateTo('login')}
                className="rounded-xl bg-green-600 px-5 py-2.5 font-bold text-white hover:bg-green-700"
              >
                Login
              </button>
            )}
          </nav>

          <button
            type="button"
            onClick={() =>
              setMobileMenu(
                (previous) => !previous
              )
            }
            className="rounded-xl border px-3 py-2 md:hidden"
          >
            ☰
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t bg-white px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">

              <button
                onClick={() =>
                  navigateTo('home')
                }
                className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50"
              >
                Home
              </button>

              <button
                onClick={() =>
                  navigateTo('dictionary')
                }
                className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50"
              >
                Dictionary
              </button>

              <button
                onClick={() =>
                  navigateTo('lessons')
                }
                className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50"
              >
                Lessons
              </button>

              {user && (
                <button
                  onClick={() =>
                    navigateTo('progress')
                  }
                  className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50"
                >
                  Progress
                </button>
              )}

              {user ? (
                <button
                  onClick={logout}
                  className="rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() =>
                    navigateTo('login')
                  }
                  className="rounded-xl bg-green-600 px-4 py-3 text-left font-bold text-white"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    )
  }

  function renderHome() {
    return (
      <main>
        <section className="bg-gradient-to-br from-green-50 via-white to-yellow-50">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">

            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                🇳🇬 Nigerian & international languages
              </div>

              <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Learn languages.
                <span className="text-green-600">
                  {' '}
                  One lesson at a time.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                LingoNaija helps you learn Nigerian
                and international languages through
                simple text-based lessons, vocabulary
                and interactive questions.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() =>
                    navigateTo('lessons')
                  }
                  className="rounded-xl bg-green-600 px-7 py-4 font-bold text-white shadow-sm hover:bg-green-700"
                >
                  Start Learning
                </button>

                <button
                  onClick={() =>
                    navigateTo('dictionary')
                  }
                  className="rounded-xl border-2 border-slate-200 bg-white px-7 py-4 font-bold text-slate-800 hover:bg-slate-50"
                >
                  Explore Dictionary
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg rounded-3xl border bg-white p-6 shadow-xl">
                <div className="rounded-2xl bg-green-600 p-6 text-white">
                  <div className="text-sm font-semibold opacity-80">
                    Today's lesson
                  </div>

                  <div className="mt-2 text-3xl font-black">
                    Hausa 🇳🇬
                  </div>

                  <div className="mt-2 text-green-50">
                    Gaisuwa da Gabatarwa
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">
                      What does
                    </div>

                    <div className="mt-1 text-xl font-bold">
                      sannu
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      mean?
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 font-semibold text-green-700">
                    Hello / greetings
                  </div>

                  <div className="rounded-xl border p-4 font-semibold">
                    Water
                  </div>

                  <div className="rounded-xl border p-4 font-semibold">
                    House
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-wide text-green-600">
              What you can do
            </div>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Learn your way
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border bg-white p-7 shadow-sm">
              <div className="text-4xl">
                📚
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Lessons
              </h3>

              <p className="mt-2 leading-7 text-slate-600">
                Follow structured lessons and
                answer questions as you learn.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-7 shadow-sm">
              <div className="text-4xl">
                📖
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Dictionary
              </h3>

              <p className="mt-2 leading-7 text-slate-600">
                Look up useful words and see
                their meanings and examples.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-7 shadow-sm">
              <div className="text-4xl">
                🏆
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Progress
              </h3>

              <p className="mt-2 leading-7 text-slate-600">
                Earn XP and track your learning
                progress as you complete lessons.
              </p>
            </div>

          </div>
        </section>

        <section className="bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white">
              Ready to start learning?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Choose a language and begin your first
              lesson.
            </p>

            <button
              onClick={() =>
                navigateTo('lessons')
              }
              className="mt-7 rounded-xl bg-green-600 px-7 py-4 font-bold text-white hover:bg-green-500"
            >
              Start Learning
            </button>
          </div>
        </section>
      </main>
    )
  }

  function renderLanguageSelector() {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <label className="text-sm font-bold text-slate-700">
          Choose a language
        </label>

        <select
          value={selectedLanguage}
          onChange={(event) =>
            chooseLanguage(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-green-500"
        >
          {languages.length > 0 ? (
            languages.map((language) => (
              <option
                key={language.id}
                value={language.code}
              >
                {language.name}
              </option>
            ))
          ) : (
            <>
              <option value="hausa">
                Hausa
              </option>

              <option value="yoruba">
                Yorùbá
              </option>

              <option value="igbo">
                Igbo
              </option>

              <option value="english">
                English
              </option>

              <option value="spanish">
                Español
              </option>

              <option value="french">
                Français
              </option>
            </>
          )}
        </select>
      </div>
    )
  }

  function renderDictionary() {
    const filteredWords =
      dictionary.filter((item) => {
        const search =
          dictionarySearch
            .trim()
            .toLowerCase()

        if (!search) {
          return true
        }

        return (
          String(item.word || '')
            .toLowerCase()
            .includes(search) ||
          String(item.meaning || '')
            .toLowerCase()
            .includes(search)
        )
      })

    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <div className="text-sm font-bold uppercase tracking-wide text-green-600">
            Dictionary
          </div>

          <h1 className="mt-2 text-4xl font-black">
            Explore words
          </h1>

          <p className="mt-3 text-slate-600">
            Search vocabulary for your chosen
            language.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">

          <div className="space-y-5">
            {renderLanguageSelector()}

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <label className="text-sm font-bold text-slate-700">
                Search dictionary
              </label>

              <input
                value={dictionarySearch}
                onChange={(event) =>
                  setDictionarySearch(
                    event.target.value
                  )
                }
                placeholder="Search a word..."
                className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            {dictionaryLoading ? (
              <div className="rounded-2xl border bg-white p-10 text-center">
                <div className="text-4xl">
                  ⏳
                </div>

                <p className="mt-3 font-semibold">
                  Loading dictionary...
                </p>
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center">
                <div className="text-4xl">
                  🔎
                </div>

                <h2 className="mt-3 text-xl font-bold">
                  No words found
                </h2>

                <p className="mt-2 text-slate-500">
                  Try another search term.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredWords.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-2xl font-black text-slate-900">
                          {item.word}
                        </div>

                        <div className="mt-1 text-green-600">
                          {item.meaning}
                        </div>
                      </div>

                      {item.category && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {item.example && (
                      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        <span className="font-bold">
                          Example:
                        </span>{' '}
                        {item.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    )
  }

  function renderLessons() {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <div className="text-sm font-bold uppercase tracking-wide text-green-600">
            Lessons
          </div>

          <h1 className="mt-2 text-4xl font-black">
            Learn step by step
          </h1>

          <p className="mt-3 text-slate-600">
            Choose a language and start a lesson.
          </p>
        </div>

        <div className="mb-8 max-w-sm">
          {renderLanguageSelector()}
        </div>

        {lessonsLoading ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <div className="text-4xl">
              ⏳
            </div>

            <p className="mt-3 font-semibold">
              Loading lessons...
            </p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <div className="text-5xl">
              📚
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              No lessons available
            </h2>

            <p className="mt-2 text-slate-600">
              There are currently no lessons for
              this language.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson, index) => {
              const questionCount =
                Array.isArray(
                  lesson.questions
                )
                  ? lesson.questions.length
                  : 0

              return (
                <div
                  key={lesson.id}
                  className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl font-black text-green-700">
                      {index + 1}
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                      {lesson.level}
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-black">
                    {lesson.title}
                  </h2>

                  <p className="mt-3 flex-1 leading-7 text-slate-600">
                    {lesson.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                    <span>
                      {questionCount}{' '}
                      {questionCount === 1
                        ? 'question'
                        : 'questions'}
                    </span>

                    <span>
                      Beginner
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      startLesson(lesson)
                    }
                    className="mt-5 w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
                  >
                    Start Lesson
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    )
  }

  function renderQuiz() {
    if (!selectedLesson) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border bg-white p-10 text-center">

            <div className="text-5xl">
              📚
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              No lesson selected
            </h2>

            <p className="mt-2 text-slate-600">
              Please choose a lesson first.
            </p>

            <button
              onClick={goBackToLessons}
              className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
            >
              Back to Lessons
            </button>

          </div>
        </main>
      )
    }

    const questions =
      Array.isArray(
        selectedLesson.questions
      )
        ? selectedLesson.questions
        : []

    if (questions.length === 0) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border bg-white p-10 text-center">

            <div className="text-5xl">
              ❓
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              No questions available
            </h2>

            <p className="mt-2 text-slate-600">
              This lesson does not currently
              have any questions.
            </p>

            <button
              onClick={goBackToLessons}
              className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
            >
              Back to Lessons
            </button>

          </div>
        </main>
      )
    }

    if (quizFinished) {
      const totalQuestions =
        questions.length

      const percentage =
        totalQuestions > 0
          ? Math.round(
              (quizScore /
                totalQuestions) *
                100
            )
          : 0

      return (
        <main className="mx-auto max-w-3xl px-4 py-12">

          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm sm:p-12">

            <div className="text-6xl">
              🎉
            </div>

            <h1 className="mt-5 text-3xl font-extrabold">
              Lesson Complete!
            </h1>

            <p className="mt-3 text-slate-600">
              You completed{' '}
              {selectedLesson.title}.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl bg-green-50 p-5">
                <div className="text-3xl font-extrabold text-green-700">
                  {quizScore}
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  Correct
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="text-3xl font-extrabold text-blue-700">
                  {percentage}%
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  Score
                </div>
              </div>

              <div className="rounded-2xl bg-yellow-50 p-5">
                <div className="text-3xl font-extrabold text-yellow-700">
                  +{Math.max(
                    10,
                    quizScore * 10
                  )}
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  XP earned
                </div>
              </div>

            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

              <button
                onClick={goBackToLessons}
                className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
              >
                Back to Lessons
              </button>

              <button
                onClick={() =>
                  navigateTo('progress')
                }
                className="rounded-xl border px-6 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                View Progress
              </button>

            </div>

          </div>

        </main>
      )
    }

    const safeQuestionIndex =
      Math.min(
        currentQuestion,
        questions.length - 1
      )

    const question =
      questions[safeQuestionIndex]

    if (!question) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-10">

          <div className="rounded-2xl border bg-white p-10 text-center">

            <h2 className="text-2xl font-bold">
              Unable to load this question
            </h2>

            <button
              onClick={goBackToLessons}
              className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold text-white"
            >
              Back to Lessons
            </button>

          </div>

        </main>
      )
    }

    let options = []

    if (Array.isArray(question.options)) {
      options = question.options
    } else if (
      typeof question.options === 'string'
    ) {
      try {
        const parsedOptions =
          JSON.parse(
            question.options
          )

        if (Array.isArray(parsedOptions)) {
          options = parsedOptions
        } else {
          options =
            question.options
              .split(',')
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
        }
      } catch {
        options =
          question.options
            .split(',')
            .map((item) =>
              item.trim()
            )
            .filter(Boolean)
      }
    }

    const progress =
      ((safeQuestionIndex + 1) /
        questions.length) *
      100

    function submitAnswer(answer) {
      if (!answer) return

      const correctAnswer =
        String(
          question.answer || ''
        )
          .trim()
          .toLowerCase()

      const selectedAnswer =
        String(answer)
          .trim()
          .toLowerCase()

      const isCorrect =
        selectedAnswer ===
        correctAnswer

      if (isCorrect) {
        setQuizScore(
          (previous) =>
            previous + 1
        )
      }

      if (
        safeQuestionIndex <
        questions.length - 1
      ) {
        setCurrentQuestion(
          (previous) =>
            previous + 1
        )
      } else {
        setQuizFinished(true)

        const finalScore =
          isCorrect
            ? quizScore + 1
            : quizScore

        const earnedXp =
          Math.max(
            10,
            finalScore * 10
          )

        setXp(
          (previous) =>
            previous + earnedXp
        )

        setCompletedLessons(
          (previous) =>
            previous + 1
        )

        setStreak(
          (previous) =>
            previous === 0
              ? 1
              : previous + 1
        )
      }
    }

    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        <button
          onClick={goBackToLessons}
          className="mb-6 text-sm font-semibold text-green-700 hover:text-green-800"
        >
          ← Back to Lessons
        </button>

        <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-10">

          <div className="mb-8">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <span className="text-sm font-semibold text-slate-500">
                Question{' '}
                {safeQuestionIndex + 1}{' '}
                of {questions.length}
              </span>

              <span className="text-sm font-semibold text-green-600">
                {selectedLesson.title}
              </span>

            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-green-600 transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          <div className="rounded-2xl bg-slate-50 p-6 text-center sm:p-8">

            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-600">
              {question.question_type ||
                'Question'}
            </div>

            <h1 className="text-2xl font-extrabold leading-relaxed text-slate-900 sm:text-3xl">
              {question.prompt}
            </h1>

          </div>

          {options.length > 0 ? (
            <div className="mt-8 grid gap-3">

              {options.map(
                (option, index) => (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    onClick={() =>
                      submitAnswer(
                        option
                      )
                    }
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-4 text-left font-semibold text-slate-800 transition hover:border-green-500 hover:bg-green-50 active:scale-[0.99]"
                  >

                    <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    {option}

                  </button>
                )
              )}

            </div>
          ) : (
            <form
              className="mt-8"
              onSubmit={(event) => {
                event.preventDefault()

                const formData =
                  new FormData(
                    event.currentTarget
                  )

                const answer =
                  formData
                    .get('answer')
                    ?.toString()
                    .trim() || ''

                if (!answer) return

                submitAnswer(answer)

                event.currentTarget.reset()
              }}
            >

              <input
                name="answer"
                type="text"
                placeholder="Type your answer..."
                autoComplete="off"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-4 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-green-600 px-5 py-4 font-bold text-white hover:bg-green-700"
              >
                Check Answer
              </button>

            </form>
          )}

        </div>

      </main>
    )
  }

  function renderProgress() {
    const totalXp = xp
    const totalCompleted =
      completedLessons

    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <div className="text-sm font-bold uppercase tracking-wide text-green-600">
            Your Progress
          </div>

          <h1 className="mt-2 text-4xl font-black">
            Keep learning
          </h1>

          <p className="mt-3 text-slate-600">
            Track your learning activity and
            achievements.
          </p>
        </div>

        {!user ? (
          <div className="rounded-2xl border bg-white p-10 text-center">

            <div className="text-5xl">
              🔐
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              Log in to save your progress
            </h2>

            <p className="mt-2 text-slate-600">
              Create an account or log in to
              track your learning.
            </p>

            <button
              onClick={() =>
                navigateTo('login')
              }
              className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
            >
              Log In
            </button>

          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-3xl">
                  ⭐
                </div>

                <div className="mt-4 text-3xl font-black">
                  {totalXp}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Total XP
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-3xl">
                  🔥
                </div>

                <div className="mt-4 text-3xl font-black">
                  {streak}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Day streak
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-3xl">
                  📚
                </div>

                <div className="mt-4 text-3xl font-black">
                  {totalCompleted}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Lessons completed
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-3xl">
                  🌍
                </div>

                <div className="mt-4 text-3xl font-black">
                  {languages.length ||
                    6}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Languages
                </div>
              </div>

            </div>

            <div className="mt-8 rounded-2xl border bg-white p-7 shadow-sm">

              <h2 className="text-xl font-black">
                Keep your streak going
              </h2>

              <p className="mt-2 text-slate-600">
                Complete another lesson to keep
                building your language skills.
              </p>

              <button
                onClick={() =>
                  navigateTo('lessons')
                }
                className="mt-5 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
              >
                Continue Learning
              </button>

            </div>
          </>
        )}

      </main>
    )
  }

  function renderAuth() {
    const isRegister =
      page === 'register'

    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4 py-12">

        <div className="w-full max-w-md rounded-3xl border bg-white p-7 shadow-sm sm:p-9">

          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-2xl font-black text-white">
              L
            </div>

            <h1 className="mt-5 text-3xl font-black">
              {isRegister
                ? 'Create your account'
                : 'Welcome back'}
            </h1>

            <p className="mt-2 text-slate-600">
              {isRegister
                ? 'Start your language learning journey.'
                : 'Log in to continue learning.'}
            </p>

          </div>

          {authError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {authError}
            </div>
          )}

          {authMessage && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              {authMessage}
            </div>
          )}

          <form
            onSubmit={handleAuthSubmit}
            className="mt-7 space-y-5"
          >

            {isRegister && (
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Username
                </label>

                <input
                  name="username"
                  value={authForm.username}
                  onChange={
                    handleAuthChange
                  }
                  required
                  placeholder="Enter your username"
                  className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-slate-700">
                Email
              </label>

              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={
                  handleAuthChange
                }
                required
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>

              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={
                  handleAuthChange
                }
                required
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authLoading
                ? 'Please wait...'
                : isRegister
                  ? 'Create Account'
                  : 'Log In'}
            </button>

          </form>

          <div className="mt-7 text-center text-sm text-slate-600">

            {isRegister ? (
              <>
                Already have an account?{' '}

                <button
                  onClick={() =>
                    navigateTo('login')
                  }
                  className="font-bold text-green-600 hover:text-green-700"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}

                <button
                  onClick={() =>
                    navigateTo('register')
                  }
                  className="font-bold text-green-600 hover:text-green-700"
                >
                  Create one
                </button>
              </>
            )}

          </div>

        </div>

      </main>
    )
  }

  function renderPage() {
    if (page === 'home') {
      return renderHome()
    }

    if (page === 'dictionary') {
      return renderDictionary()
    }

    if (page === 'lessons') {
      return renderLessons()
    }

    if (page === 'quiz') {
      return renderQuiz()
    }

    if (page === 'progress') {
      return renderProgress()
    }

    if (
      page === 'login' ||
      page === 'register'
    ) {
      return renderAuth()
    }

    return renderHome()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {renderHeader()}

      {renderPage()}

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>
            © 2026 LingoNaija. Learn languages,
            connect with people.
          </p>
        </div>
      </footer>

    </div>
  )
}

export default App