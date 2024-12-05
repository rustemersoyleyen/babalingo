document.addEventListener('DOMContentLoaded', function () {
    const pages = {
        home: document.getElementById('home-page'),
        exercises: document.getElementById('exercises-page'),
        wordFind: document.getElementById('word-find-page'),
        wordWrite: document.getElementById('word-write-page'),
        sentenceComplete: document.getElementById('sentence-complete-page'),
        sentenceFormat: document.getElementById('sentence-format-page'),
    };

    let languageDirection = 'en-tr'; // Default direction: English → Turkish

    // Sayfaları Göster/Gizle
    function showPage(pageToShow) {
        Object.values(pages).forEach(page => page.style.display = 'none');
        pageToShow.style.display = 'block';
    }

    // Üniteleri Yükleme
    function loadUnits() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                const unitsContainer = document.getElementById('units-container');
                data.units.forEach(unit => {
                    const unitCard = document.createElement('div');
                    unitCard.classList.add('unit-card');
                    const img = document.createElement('img');
                    img.src = `img/${unit.unitImage}`;
                    img.alt = unit.unitName;
                    const title = document.createElement('h2');
                    title.textContent = unit.unitName;
                    unitCard.appendChild(img);
                    unitCard.appendChild(title);
                    unitCard.addEventListener('click', () => {
                        showPage(pages.exercises);
                        loadUnitExercises(unit);
                    });
                    unitsContainer.appendChild(unitCard);
                });
            })
            .catch(error => console.error('Veri yüklenirken hata:', error));
    }

    // Egzersizleri Yükleme
    function loadUnitExercises(unit) {
        const exercisesContainer = document.getElementById('exercises-container');
        const unitTitle = document.getElementById('unit-title');
        exercisesContainer.innerHTML = '';
        unitTitle.textContent = `${unit.unitName} Egzersizleri`;

        const exercises = [
            { name: 'Kelime Bulma', page: pages.wordFind, image: 'word-find.jpeg', action: () => startWordFind(unit.words) },
            { name: 'Kelime Yazma', page: pages.wordWrite, image: 'word-write.jpeg', action: () => startWordWrite(unit.words) },
            { name: 'Cümle Tamamlama', page: pages.sentenceComplete, image: 'sentence-complete.jpeg', action:()=>startSentenceComplete(unit.sentences) },
            { name: 'Cümle Oluşturma', page: pages.sentenceFormat, image: 'sentence-format.jpeg', action: () => {
                showPage(pages.sentenceFormat); // Sayfaya geçişi sağlar
                startSentenceFormat(unit.sentences); // Egzersizi başlatır
            }}
        ];

        exercises.forEach(exercise => {
            const exerciseCard = document.createElement('div');
            exerciseCard.classList.add('exercise-card');
            const img = document.createElement('img');
            img.src = `img/${exercise.image}`;
            img.alt = exercise.name;
            const title = document.createElement('h2');
            title.textContent = exercise.name;
            exerciseCard.appendChild(img);
            exerciseCard.appendChild(title);
            exerciseCard.addEventListener('click', () => {
                showPage(exercise.page);
                exercise.action && exercise.action();
            });
            exercisesContainer.appendChild(exerciseCard);
        });

        const backButton = document.createElement('button');
        backButton.textContent = 'Geri Dön';
        backButton.classList.add('back-button');
        backButton.addEventListener('click', () => showPage(pages.home));
        exercisesContainer.appendChild(backButton);
    }

    // Kelime Bulma Egzersizi
    function startWordFind(words) {
        let score = 0;
        let currentWord = null;
        let remainingWords = [...words];

        const scoreValue = document.getElementById('scoreValue');
        const wordImage = document.getElementById('wordImage');
        const wordDisplay = document.getElementById('wordDisplay');
        const optionsContainer = document.getElementById('optionsContainer');
        const resultMessage = document.getElementById('resultMessage');

        // Dil değiştirme butonunun etkinleştirilmesi
        document.getElementById('language-toggle-find').onclick = () => {
            languageDirection = languageDirection === 'en-tr' ? 'tr-en' : 'en-tr';
            document.getElementById('language-toggle-find').textContent = languageDirection === 'en-tr' ? 'İngilizce → Türkçe' : 'Türkçe → İngilizce';

            resetGame();
        };

        document.getElementById('back-button-find').onclick = () => showPage(pages.exercises);

        const resetGame = () => {
            remainingWords = [...words];
            scoreValue.textContent = score;
            loadNextWord();
        };

        const loadNextWord = () => {
            if (remainingWords.length === 0) {
                resultMessage.textContent = 'Tüm kelimeler tamamlandı!';
                return;
            }

            currentWord = remainingWords.splice(Math.floor(Math.random() * remainingWords.length), 1)[0];
            wordImage.src = `img/words/${currentWord.image}`;
            wordDisplay.textContent = languageDirection === 'en-tr' ? currentWord.english : currentWord.turkish;

            // Sesli okuma butonu
            //setupSpeechSynthesis(wordDisplay.textContent, languageDirection === 'en-tr' ? 'en-US' : 'tr-TR');
            setupSpeechSynthesis(wordDisplay.textContent, languageDirection === 'en-tr' ? 'en-US' : 'tr-TR', 'wordDisplay');



            const options = [currentWord, ...words.filter(w => w !== currentWord).sort(() => Math.random() - 0.5).slice(0, 3)];
            optionsContainer.innerHTML = '';
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.classList.add('option');
                btn.textContent = languageDirection === 'en-tr' ? option.turkish : option.english;
                btn.addEventListener('click', () => {
                    const correct = languageDirection === 'en-tr' ? currentWord.turkish : currentWord.english;
                    const isCorrect = btn.textContent === correct;
                    btn.classList.add(isCorrect ? 'correct' : 'wrong');
                    score += isCorrect ? 5 : -2;
                    scoreValue.textContent = score;

                    if (isCorrect) playCongratulationSound();
                    else {
                        playErrorSound();
                        resultMessage.textContent = `Doğru Cevap: ${correct}`;
                    }

                    setTimeout(() => {
                        resultMessage.textContent = '';
                        loadNextWord();
                    }, 1000);
                });
                optionsContainer.appendChild(btn);
            });
        };

        resetGame();
    }

    // Kelime Yazma Egzersizi
    function startWordWrite(words) {
        let score = 0;
        let currentWord = null;
        let remainingWords = [...words];

        const scoreValue = document.getElementById('scoreValueWrite');
        const wordImage = document.getElementById('writeWordImage');
        const wordDisplay = document.getElementById('writeWordDisplay');
        const inputAnswer = document.getElementById('writeAnswerInput');
        const resultMessage = document.getElementById('resultMessageWrite');

        // Geri butonu ve dil değiştirme butonu
        document.getElementById('back-button-write').onclick = () => showPage(pages.exercises);
        document.getElementById('language-toggle-write').onclick = () => {
            languageDirection = languageDirection === 'en-tr' ? 'tr-en' : 'en-tr';
            document.getElementById('language-toggle-write').textContent = languageDirection === 'en-tr' ? 'İngilizce → Türkçe' : 'Türkçe → İngilizce';

            resetGame();
        };

        const resetGame = () => {
            remainingWords = [...words];
            scoreValue.textContent = score;
            loadNextWord();
        };

        const loadNextWord = () => {
            if (remainingWords.length === 0) {
                resultMessage.textContent = 'Tüm kelimeler tamamlandı!';
                return;
            }

            currentWord = remainingWords.splice(Math.floor(Math.random() * remainingWords.length), 1)[0];
            wordImage.src = `img/words/${currentWord.image}`;
            wordDisplay.textContent = languageDirection === 'en-tr' ? currentWord.english : currentWord.turkish;

            // Sesli okuma butonu
            //setupSpeechSynthesis(wordDisplay.textContent, languageDirection === 'en-tr' ? 'en-US' : 'tr-TR');
            setupSpeechSynthesis(wordDisplay.textContent, languageDirection === 'en-tr' ? 'en-US' : 'tr-TR', 'writeWordDisplay');


            inputAnswer.value = '';
            resultMessage.textContent = '';
        };

        // Kontrol butonunun etkinleştirilmesi
        inputAnswer.addEventListener('input', () => {
            document.getElementById('checkWriteButton').disabled = inputAnswer.value.trim() === '';
        });

        document.getElementById('checkWriteButton').onclick = () => {
            const correctAnswer = languageDirection === 'en-tr' ? currentWord.turkish : currentWord.english;
            const isCorrect = inputAnswer.value.trim().toLowerCase() === correctAnswer.toLowerCase();
            resultMessage.textContent = isCorrect ? 'Doğru!' : `Yanlış! Doğru Cevap: ${correctAnswer}`;
            resultMessage.style.color = isCorrect ? 'green' : 'red';
            score += isCorrect ? 5 : -2;
            scoreValue.textContent = score;

            if (isCorrect) playCongratulationSound();
            else playErrorSound();

            setTimeout(() => {
                resultMessage.textContent = '';
                loadNextWord();
            }, 1000);
        };

        resetGame();
    }
    // Cümle Oluşturma Egzersizi (sentenceComplete) - Eklendi
    
    function startSentenceComplete(sentences) {
        let score = 0;
        let currentSentence = null;
    
        const scoreValue = document.getElementById('scoreValueComplete');
        const shuffledWordsContainer = document.getElementById('shuffledWords');
        const resultContainer = document.getElementById('resultSentenceContainer');
        const sentenceImage = document.getElementById('sentenceImage');
        const resultMessage = document.getElementById('resultMessageComplete');
        const checkButton = document.getElementById('checkSentenceButton');
        const backButton = document.getElementById('backButtonComplete');
    
        backButton.onclick = () => showPage(pages.exercises);
    
        // Rastgele bir cümle seçme ve kelimeleri karıştırma
        function loadNextSentence() {
            if (sentences.length === 0) {
                resultMessage.textContent = 'Tüm cümleler tamamlandı!';
                return;
            }
    
            currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
            const words = currentSentence.english.split(' ');
            const shuffledWords = words.sort(() => Math.random() - 0.5);
    
            shuffledWordsContainer.innerHTML = '';
            resultContainer.innerHTML = '';
    
            // Cümle görselini yükle
            sentenceImage.src = `img/sentences/${currentSentence.image}`;
            sentenceImage.style.display = 'block';
    
            shuffledWords.forEach((word) => {
                const wordElement = document.createElement('span');
                wordElement.textContent = word;
                wordElement.classList.add('shuffled-word');
                wordElement.onclick = () => addWordToResult(wordElement, word);
                shuffledWordsContainer.appendChild(wordElement);
            });
    
            resultMessage.textContent = '';
        }
    
        // Kelimeyi cümleye ekleme
        function addWordToResult(wordElement, word) {
            const wordInResult = document.createElement('span');
            wordInResult.textContent = word;
            wordInResult.classList.add('result-word');
            wordInResult.onclick = () => removeWordFromResult(wordInResult, word);
    
            resultContainer.appendChild(wordInResult);
    
            // Kelimeyi devre dışı bırak
            wordElement.classList.add('used-word');
            wordElement.onclick = null;
        }
    
        // Kelimeyi cümleden çıkarma ve geri gönderme
        function removeWordFromResult(wordElement, word) {
            wordElement.remove();
    
            // Kelimeyi tekrar aktif yap
            const unusedWordElement = Array.from(shuffledWordsContainer.children).find(
                (el) => el.textContent === word && el.classList.contains('used-word')
            );
            if (unusedWordElement) {
                unusedWordElement.classList.remove('used-word');
                unusedWordElement.onclick = () => addWordToResult(unusedWordElement, word);
            }
        }
    
        // Cümleyi kontrol etme
        checkButton.onclick = () => {
            const userAnswer = Array.from(resultContainer.children)
                .map((child) => child.textContent)
                .join(' ');
            const correctAnswer = currentSentence.english;
    
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                //resultMessage.textContent = 'Tebrikler! Cümle doğru.';
                resultMessage.innerHTML = `Tebrikler! Cümle doğru.<br/> <strong> ${currentSentence.english} --> ${currentSentence.turkish}</strong>`;

                resultMessage.style.color = 'green';
                score += 10;
                scoreValue.textContent = score;
    
                setTimeout(loadNextSentence, 1500);
            } else {
                resultMessage.innerHTML = `Hatalı ! <br/> <strong> Doğru Cevap:  ${currentSentence.english} --> ${currentSentence.turkish}</strong>`;
                resultMessage.style.color = 'red';
    
                setTimeout(loadNextSentence, 3000);
            }
        };
    
        loadNextSentence();
    }
    
    

    // Cümle Oluşturma Egzersizi (sentenceComplete) - Bitir

    // Cümle tamamlama Egzersizi (sentenceFormat) - Başla

    function startSentenceFormat(sentences) {
        let score = 0;
        let currentSentence = null;
        let missingWord = '';
    
        const scoreValue = document.getElementById('scoreValueFormat');
        const sentenceImage = document.getElementById('sentenceImageFormat');
        const sentenceText = document.getElementById('sentenceText');
        const missingWordInput = document.getElementById('missingWordInput');
        const resultMessage = document.getElementById('resultMessageFormat');
        const checkButton = document.getElementById('checkFormatButton');
        const backButton = document.getElementById('backButtonFormat');

        console.log('scoreValue:', !!scoreValue ? 'Bulundu' : 'Eksik');
        console.log('sentenceImage:', !!sentenceImage ? 'Bulundu' : 'Eksik');
        console.log('sentenceText:', !!sentenceText ? 'Bulundu' : 'Eksik');
        console.log('missingWordInput:', !!missingWordInput ? 'Bulundu' : 'Eksik');
        console.log('resultMessage:', !!resultMessage ? 'Bulundu' : 'Eksik');
        console.log('checkButton:', !!checkButton ? 'Bulundu' : 'Eksik');
        console.log('backButton:', !!backButton ? 'Bulundu' : 'Eksik');
    
        // Eğer elemanlardan biri eksikse işlemi durdur
        if (!scoreValue || !sentenceImage || !sentenceText || !missingWordInput || !resultMessage || !checkButton || !backButton) {
            console.error('Bazı gerekli elemanlar DOM içinde bulunamadı. Lütfen HTML yapısını kontrol edin.');
            return;
        }
    
        backButton.onclick = () => {
            showPage(pages.exercises);
        };
    
        function loadNextSentence() {
            if (sentences.length === 0) {
                resultMessage.textContent = 'Tüm cümleler tamamlandı!';
                return;
            }
    
            currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
            const words = currentSentence.english.split(' ');
    
            const randomIndex = Math.floor(Math.random() * words.length);
            missingWord = words[randomIndex];
            words[randomIndex] = '_____';
    
            sentenceText.textContent = words.join(' ');
            loadSentenceImage(currentSentence);
    
            missingWordInput.value = '';
            resultMessage.textContent = '';
        }
    
        function loadSentenceImage(sentence) {
            if (sentence.image) {
                sentenceImage.src = `img/sentences/${sentence.image}`;
                sentenceImage.alt = `Cümle görseli: ${sentence.english}`;
                sentenceImage.style.display = 'block';
            } else {
                sentenceImage.src = '';
                sentenceImage.alt = 'Görsel mevcut değil';
                sentenceImage.style.display = 'none';
            }
        }
    
        checkButton.onclick = () => {
            const userAnswer = missingWordInput.value.trim().toLowerCase();
            const correctAnswer = missingWord.toLowerCase();
    
            if (userAnswer === correctAnswer) {
                resultMessage.innerHTML = `Tebrikler! Doğru cevap.<br/><strong>${currentSentence.english} --> ${currentSentence.turkish}</strong>`;
                resultMessage.style.color = 'green';
                score += 7;
            } else {
                resultMessage.innerHTML = `Yanlış! Doğru Cevap: <strong>${missingWord}</strong> (${currentSentence.turkish})`;
                resultMessage.style.color = 'red';
                score -= 1;
            }
    
            scoreValue.textContent = score;
    
            setTimeout(loadNextSentence, 3000);
        };
    
        loadNextSentence();
    }
    
    
    
    // Cümle tamamlama Egzersizi (sentenceFormat) - Başla

    // Ses Efektleri
    function setupSpeechSynthesis(text, lang, targetElementId) {
        const speakButton = document.createElement('button');
        speakButton.textContent = '🔊'; // Ses butonu simgesi
        speakButton.classList.add('speak-button');
        speakButton.onclick = () => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        };
        document.getElementById(targetElementId).appendChild(speakButton);
    }
    

    function playCongratulationSound() {
        const utterance = new SpeechSynthesisUtterance('Tebrikler!');
        utterance.lang = 'tr-TR';
        window.speechSynthesis.speak(utterance);
    }

    function playErrorSound() {
        const utterance = new SpeechSynthesisUtterance('Yanlış!');
        utterance.lang = 'tr-TR';
        window.speechSynthesis.speak(utterance);
    }

    loadUnits();
});
