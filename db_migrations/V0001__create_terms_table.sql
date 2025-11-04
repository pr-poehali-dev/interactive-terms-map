-- Создаем таблицу терминов
CREATE TABLE IF NOT EXISTS terms (
    id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    normative_source VARCHAR(255),
    example TEXT,
    related_terms INTEGER[],
    source_site VARCHAR(255),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем примеры терминов
INSERT INTO terms (term, definition, category, normative_source, example, related_terms, source_site, note) VALUES
('JavaScript', 'Высокоуровневый, интерпретируемый язык программирования, который является одной из основных технологий Всемирной паутины.', 'Программирование', 'ECMAScript', 'console.log(''Hello, World!'');', ARRAY[2, 3], 'developer.mozilla.org', 'Первоначально создан для добавления интерактивности на веб-страницы'),
('D3.js', 'Библиотека JavaScript для создания интерактивных визуализаций данных в веб-браузерах.', 'Библиотеки', 'D3.js Documentation', 'd3.select(''body'').append(''p'').text(''Hello D3!'');', ARRAY[1, 3], 'd3js.org', 'Использует стандарты SVG, HTML5 и CSS'),
('SVG', 'Масштабируемая векторная графика - язык разметки на основе XML для описания двухмерной векторной графики.', 'Графика', 'W3C SVG Specification', '<svg width=''100'' height=''100''><circle cx=''50'' cy=''50'' r=''40'' fill=''blue''/></svg>', ARRAY[1, 2], 'w3.org/Graphics/SVG', 'Поддерживает интерактивность и анимацию'),
('React', 'Библиотека JavaScript для создания пользовательских интерфейсов.', 'Библиотеки', 'React Documentation', 'const App = () => <div>Hello React</div>;', ARRAY[1, 5], 'react.dev', 'Разработана командой Facebook'),
('TypeScript', 'Строго типизированный язык программирования, основанный на JavaScript.', 'Программирование', 'TypeScript Documentation', 'let message: string = ''Hello TypeScript'';', ARRAY[1, 4], 'typescriptlang.org', 'Добавляет статическую типизацию в JavaScript'),
('CSS', 'Каскадные таблицы стилей - язык описания внешнего вида документа, написанного с использованием языка разметки.', 'Стилизация', 'W3C CSS Specification', 'body { background-color: #f0f0f0; }', ARRAY[3], 'w3.org/Style/CSS', 'Используется для оформления веб-страниц'),
('HTML', 'Язык гипертекстовой разметки для создания веб-страниц и веб-приложений.', 'Разметка', 'W3C HTML Specification', '<html><body><h1>Hello HTML</h1></body></html>', ARRAY[3, 6], 'w3.org/html', 'Основа структуры веб-страниц'),
('API', 'Программный интерфейс приложения - набор методов для взаимодействия программ между собой.', 'Архитектура', 'Industry Standard', 'fetch(''/api/data'').then(res => res.json());', ARRAY[1], 'various', 'Позволяет приложениям обмениваться данными'),
('REST', 'Архитектурный стиль взаимодействия компонентов распределенного приложения в сети.', 'Архитектура', 'Roy Fielding Dissertation', 'GET /api/users HTTP/1.1', ARRAY[8], 'restfulapi.net', 'Основан на протоколе HTTP'),
('JSON', 'Текстовый формат обмена данными, основанный на JavaScript.', 'Форматы данных', 'ECMA-404', '{"name": "John", "age": 30}', ARRAY[1, 8], 'json.org', 'Легко читается человеком и машиной');

-- Создаем индексы для быстрого поиска
CREATE INDEX idx_terms_category ON terms(category);
CREATE INDEX idx_terms_term ON terms(term);
