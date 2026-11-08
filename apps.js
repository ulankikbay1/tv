/* Список приложений и поисковиков. Редактируйте под себя.
   Формат: id (уникальный, латиница), name, url, color. */
var APPS = [
  { id: 'google', name: 'Google',          url: 'https://www.google.com/',        color: '#4285f4' },
  { id: 'ddg',    name: 'DuckDuckGo Lite', url: 'https://lite.duckduckgo.com/lite/', color: '#de5833' },
  { id: 'bing',   name: 'Bing',            url: 'https://www.bing.com/',          color: '#00809d' },
  { id: 'wiki',   name: 'Википедия',       url: 'https://ru.m.wikipedia.org/',    color: '#666666' },
  { id: 'yt',     name: 'YouTube (тест)',  url: 'https://www.youtube.com/',       color: '#cc0000' },
  { id: 'ytm',    name: 'YouTube m. (тест)', url: 'https://m.youtube.com/',       color: '#990000' },
  { id: 'diag',   name: 'Диагностика ТВ',  url: 'test.html',                      color: '#22aa77' }
];

/* Режимы поиска (строка запроса добавляется в конец URL) */
var ENGINES = [
  { name: 'Google',        url: 'https://www.google.com/search?q=' },
  { name: 'Google Видео',  url: 'https://www.google.com/search?tbm=vid&q=' },
  { name: 'YouTube',       url: 'https://www.youtube.com/results?search_query=' },
  { name: 'DuckDuckGo',    url: 'https://lite.duckduckgo.com/lite/?q=' },
  { name: 'Bing',          url: 'https://www.bing.com/search?q=' }
];
