import json
from app.database import Base, SessionLocal, engine
from app.models import Language, DictionaryWord, Lesson, Question
Base.metadata.create_all(bind=engine)
db = SessionLocal()
languages = [
    ("Hausa", "hausa", "Nigeria & West Africa"),
    ("Yorùbá", "yoruba", "Nigeria & West Africa"),
    ("Igbo", "igbo", "Nigeria & West Africa"),
    ("English", "english", "International"),
    ("Español", "spanish", "International"),
    ("Français", "french", "International"),
]
words = {
    "hausa": [
        ("sannu", "hello / greetings", "Sannu, ya ya aiki?", "Greetings"),
        ("na gode", "thank you", "Na gode sosai.", "Basics"),
        ("ruwa", "water", "Ina son ruwa.", "Everyday"),
        ("abinci", "food", "Abincin yana da dadi.", "Everyday"),
        ("gida", "house / home", "Ina gida.", "Everyday"),
        ("iyali", "family", "Ina son iyalina.", "Family"),
        ("aboki", "friend", "Shi abokina ne.", "People"),
        ("yau", "today", "Yau rana ce mai kyau.", "Time"),
    ],
    "yoruba": [
        ("báwo ni", "how are you?", "Báwo ni, ọ̀rẹ́ mi?", "Greetings"),
        ("ẹ ṣé", "thank you", "Ẹ ṣé gan-an.", "Basics"),
        ("omi", "water", "Mo fẹ́ omi.", "Everyday"),
        ("ilé", "house / home", "Mo wà ní ilé.", "Everyday"),
        ("oúnjẹ", "food", "Mo fẹ́ oúnjẹ.", "Everyday"),
        ("ẹbí", "family", "Mo fẹ́ràn ẹbí mi.", "Family"),
        ("ọ̀rẹ́", "friend", "Ó jẹ́ ọ̀rẹ́ mi.", "People"),
        ("òní", "today", "Òní jẹ́ ọjọ́ rere.", "Time"),
    ],
    "igbo": [
        ("ndewo", "hello", "Ndewo, kedu?", "Greetings"),
        ("daalụ", "thank you", "Daalụ nke ukwuu.", "Basics"),
        ("mmiri", "water", "Achọrọ m mmiri.", "Everyday"),
        ("ụlọ", "house / home", "Anọ m n'ụlọ.", "Everyday"),
        ("nri", "food", "Achọrọ m nri.", "Everyday"),
        ("ezinụlọ", "family", "Ezinụlọ m dị mma.", "Family"),
        ("enyi", "friend", "Ọ bụ enyi m.", "People"),
        ("taa", "today", "Taa bụ ụbọchị ọma.", "Time"),
    ],
    "english": [
        ("hello", "a greeting", "Hello, how are you?", "Greetings"),
        ("thank you", "an expression of gratitude", "Thank you very much.", "Basics"),
        ("water", "a liquid people drink", "Please give me some water.", "Everyday"),
        ("house", "a place where people live", "I am at home.", "Everyday"),
        ("food", "something people eat", "The food is ready.", "Everyday"),
        ("family", "a group of related people", "I love my family.", "Family"),
        ("friend", "a person you know and like", "He is my friend.", "People"),
        ("today", "the current day", "Today is a good day.", "Time"),
    ],
    "spanish": [
        ("hola", "hello", "Hola, ¿cómo estás?", "Greetings"),
        ("gracias", "thank you", "Muchas gracias.", "Basics"),
        ("agua", "water", "Quiero agua.", "Everyday"),
        ("casa", "house / home", "Estoy en casa.", "Everyday"),
        ("comida", "food", "La comida está lista.", "Everyday"),
        ("familia", "family", "Amo a mi familia.", "Family"),
        ("amigo", "friend", "Él es mi amigo.", "People"),
        ("hoy", "today", "Hoy es un buen día.", "Time"),
    ],
    "french": [
        ("bonjour", "hello / good morning", "Bonjour, comment allez-vous?", "Greetings"),
        ("merci", "thank you", "Merci beaucoup.", "Basics"),
        ("eau", "water", "Je veux de l'eau.", "Everyday"),
        ("maison", "house / home", "Je suis à la maison.", "Everyday"),
        ("nourriture", "food", "La nourriture est prête.", "Everyday"),
        ("famille", "family", "J'aime ma famille.", "Family"),
        ("ami", "friend", "Il est mon ami.", "People"),
        ("aujourd'hui", "today", "Aujourd'hui est une bonne journée.", "Time"),
    ],
}
lesson_data = {
    "hausa": [
        (
            "Gaisuwa da Gabatarwa",
            "Learn common Hausa greetings and how to introduce yourself.",
            "Beginner",
            [
                ("What does 'sannu' mean?", "translation", "hello / greetings",
                 ["hello / greetings", "water", "house", "food"]),
                ("What does 'na gode' mean?", "translation", "thank you",
                 ["thank you", "hello", "food", "friend"]),
            ],
        ),
        (
            "Abubuwan Yau da Kullum",
            "Learn useful Hausa words for everyday conversations.",
            "Beginner",
            [
                ("Which Hausa word means 'water'?", "multiple_choice", "ruwa",
                 ["ruwa", "gida", "abinci", "sannu"]),
                ("Which Hausa word means 'house'?", "multiple_choice", "gida",
                 ["gida", "ruwa", "iyali", "aboki"]),
            ],
        ),
        (
            "Iyali da Abokai",
            "Learn Hausa words for family, friends and people.",
            "Beginner",
            [
                ("Which Hausa word means 'family'?", "multiple_choice", "iyali",
                 ["iyali", "ruwa", "yau", "gida"]),
                ("Which Hausa word means 'friend'?", "multiple_choice", "aboki",
                 ["aboki", "abinci", "sannu", "iyali"]),
            ],
        ),
    ],
    "yoruba": [
        (
            "Ẹ How To Greet",
            "Learn common Yorùbá greetings and basic introductions.",
            "Beginner",
            [
                ("What does 'báwo ni' mean?", "translation", "how are you?",
                 ["how are you?", "thank you", "water", "house"]),
                ("What does 'ẹ ṣé' mean?", "translation", "thank you",
                 ["thank you", "hello", "friend", "food"]),
            ],
        ),
        (
            "Àwọn Ohun Tí A N Lò Lójoojúmọ́",
            "Learn useful Yorùbá words for everyday life.",
            "Beginner",
            [
                ("Which Yorùbá word means 'water'?", "multiple_choice", "omi",
                 ["omi", "ilé", "oúnjẹ", "ẹbí"]),
                ("Which Yorùbá word means 'house'?", "multiple_choice", "ilé",
                 ["ilé", "omi", "ọ̀rẹ́", "òní"]),
            ],
        ),
        (
            "Ẹbí àti Ọ̀rẹ́",
            "Learn Yorùbá vocabulary about family and friends.",
            "Beginner",
            [
                ("Which Yorùbá word means 'family'?", "multiple_choice", "ẹbí",
                 ["ẹbí", "omi", "ilé", "òní"]),
                ("Which Yorùbá word means 'friend'?", "multiple_choice", "ọ̀rẹ́",
                 ["ọ̀rẹ́", "oúnjẹ", "ẹbí", "omi"]),
            ],
        ),
    ],
    "igbo": [
        (
            "Ekele na Okwu Mmalite",
            "Learn common Igbo greetings and introductions.",
            "Beginner",
            [
                ("What does 'ndewo' mean?", "translation", "hello",
                 ["hello", "thank you", "water", "food"]),
                ("What does 'daalụ' mean?", "translation", "thank you",
                 ["thank you", "hello", "house", "friend"]),
            ],
        ),
        (
            "Ihe Ndị A Na-eji Kwa Ụbọchị",
            "Learn useful Igbo vocabulary for everyday conversations.",
            "Beginner",
            [
                ("Which Igbo word means 'water'?", "multiple_choice", "mmiri",
                 ["mmiri", "ụlọ", "nri", "enyi"]),
                ("Which Igbo word means 'house'?", "multiple_choice", "ụlọ",
                 ["ụlọ", "mmiri", "taa", "ezinụlọ"]),
            ],
        ),
        (
            "Ezinụlọ na Ndị Enyi",
            "Learn Igbo vocabulary about family and friends.",
            "Beginner",
            [
                ("Which Igbo word means 'family'?", "multiple_choice", "ezinụlọ",
                 ["ezinụlọ", "mmiri", "ụlọ", "taa"]),
                ("Which Igbo word means 'friend'?", "multiple_choice", "enyi",
                 ["enyi", "nri", "ndewo", "ezinụlọ"]),
            ],
        ),
    ],
    "english": [
        (
            "Greetings & Introductions",
            "Learn common English greetings and introductions.",
            "Beginner",
            [
                ("What does 'hello' mean?", "translation", "a greeting",
                 ["a greeting", "water", "food", "family"]),
                ("Which phrase expresses gratitude?", "multiple_choice", "thank you",
                 ["thank you", "hello", "house", "today"]),
            ],
        ),
        (
            "Everyday Essentials",
            "Learn useful English words for everyday life.",
            "Beginner",
            [
                ("Which word means a liquid people drink?", "multiple_choice", "water",
                 ["water", "house", "food", "family"]),
                ("Which word means something people eat?", "multiple_choice", "food",
                 ["food", "water", "friend", "today"]),
            ],
        ),
        (
            "Family & Friends",
            "Learn English vocabulary about family and relationships.",
            "Beginner",
            [
                ("Which word refers to related people?", "multiple_choice", "family",
                 ["family", "water", "house", "today"]),
                ("Which word means a person you know and like?", "multiple_choice", "friend",
                 ["friend", "food", "family", "water"]),
            ],
        ),
    ],
    "spanish": [
        (
            "Saludos y Presentaciones",
            "Learn common Spanish greetings and introductions.",
            "Beginner",
            [
                ("What does 'hola' mean?", "translation", "hello",
                 ["hello", "thank you", "water", "house"]),
                ("What does 'gracias' mean?", "translation", "thank you",
                 ["thank you", "hello", "friend", "food"]),
            ],
        ),
        (
            "Lo Esencial de Cada Día",
            "Learn useful Spanish vocabulary for everyday life.",
            "Beginner",
            [
                ("Which Spanish word means 'water'?", "multiple_choice", "agua",
                 ["agua", "casa", "comida", "familia"]),
                ("Which Spanish word means 'house'?", "multiple_choice", "casa",
                 ["casa", "agua", "amigo", "hoy"]),
            ],
        ),
        (
            "Familia y Amigos",
            "Learn Spanish vocabulary about family and friends.",
            "Beginner",
            [
                ("Which Spanish word means 'family'?", "multiple_choice", "familia",
                 ["familia", "agua", "casa", "hoy"]),
                ("Which Spanish word means 'friend'?", "multiple_choice", "amigo",
                 ["amigo", "comida", "familia", "agua"]),
            ],
        ),
    ],
    "french": [
        (
            "Salutations et Présentations",
            "Learn common French greetings and introductions.",
            "Beginner",
            [
                ("What does 'bonjour' mean?", "translation", "hello / good morning",
                 ["hello / good morning", "thank you", "water", "house"]),
                ("What does 'merci' mean?", "translation", "thank you",
                 ["thank you", "hello", "friend", "food"]),
            ],
        ),
        (
            "Les Essentiels du Quotidien",
            "Learn useful French vocabulary for everyday life.",
            "Beginner",
            [
                ("Which French word means 'water'?", "multiple_choice", "eau",
                 ["eau", "maison", "nourriture", "famille"]),
                ("Which French word means 'house'?", "multiple_choice", "maison",
                 ["maison", "eau", "ami", "aujourd'hui"]),
            ],
        ),
        (
            "Famille et Amis",
            "Learn French vocabulary about family and friends.",
            "Beginner",
            [
                ("Which French word means 'family'?", "multiple_choice", "famille",
                 ["famille", "eau", "maison", "ami"]),
                ("Which French word means 'friend'?", "multiple_choice", "ami",
                 ["ami", "nourriture", "famille", "eau"]),
            ],
        ),
    ],
}
try:
    for name, code, region in languages:
        language = db.query(Language).filter_by(code=code).first()
        if not language:
            language = Language(
                name=name,
                code=code,
                region=region
            )
            db.add(language)
            db.flush()
        # Add dictionary words that don't already exist
        existing_words = {
            word.word
            for word in db.query(DictionaryWord)
            .filter_by(language_id=language.id)
            .all()
        }
        for word, meaning, example, category in words.get(code, []):
            if word not in existing_words:
                db.add(DictionaryWord(
                    word=word,
                    meaning=meaning,
                    example=example,
                    category=category,
                    language_id=language.id,
                ))
        # Get existing lessons
        existing_lessons = (
            db.query(Lesson)
            .filter_by(language_id=language.id)
            .all()
        )
        lesson_definitions = lesson_data[code]
        # Remove old questions from existing lessons
        for lesson in existing_lessons:
            db.query(Question).filter_by(
                lesson_id=lesson.id
            ).delete()
        # Remove old lessons
        for lesson in existing_lessons:
            db.delete(lesson)
        db.flush()
        # Create the correct lessons and questions
        for title, description, level, questions in lesson_definitions:
            lesson = Lesson(
                title=title,
                description=description,
                level=level,
                language_id=language.id
            )
            db.add(lesson)
            db.flush()
            for prompt, question_type, answer, options in questions:
                db.add(
                    Question(
                        prompt=prompt,
                        question_type=question_type,
                        answer=answer,
                        options=json.dumps(options),
                        lesson_id=lesson.id
                    )
                )
    db.commit()
    print("Database seeded successfully for all six languages.")
finally:
    db.close()