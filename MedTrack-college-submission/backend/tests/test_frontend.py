from html.parser import HTMLParser
from pathlib import Path
import re

FRONTEND = Path(__file__).resolve().parents[2] / 'TRACK FRONT'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = []
        self.assets = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'script' and 'src' in attrs:
            self.assets.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.assets.append(attrs['href'])


def test_static_html_and_assets():
    for path in FRONTEND.glob('*.html'):
        text = path.read_text(encoding='utf-8')
        assert '{{' not in text and '{%' not in text
        page = Page(text)
        assert len(page.ids) == len(set(page.ids)), path.name
        for asset in page.assets:
            if not asset.startswith('https://'):
                assert (FRONTEND / asset).is_file(), (path.name, asset)
    for name in ['config.js', 'script.js', 'styles.css']:
        assert not (FRONTEND / name).exists()


def test_javascript_ids_match_pages():
    for script, pages in [('script.js', ['index.html']), ('admin.js', ['admin.html']),
                          ('auth.js', ['login.html', 'signup.html'])]:
        ids = set()
        for page in pages:
            ids.update(Page((FRONTEND / page).read_text(encoding='utf-8')).ids)
        source = (FRONTEND / 'js' / script).read_text(encoding='utf-8')
        for element_id in re.findall(r"getElementById\('([^']+)'\)", source):
            assert element_id in ids, (script, element_id)


def test_frontend_avoids_unsafe_or_obsolete_patterns():
    source = '\n'.join(p.read_text(encoding='utf-8') for p in (FRONTEND / 'js').glob('*.js'))
    for forbidden in ['alert(', 'detectedResults', 'detectedList', 'scannerBox', "'dateSelector'", '.innerHTML']:
        assert forbidden not in source
    html = (FRONTEND / 'index.html').read_text(encoding='utf-8').lower()
    for claim in ['50k+', '99%', '4.9', 'hipaa', 'end-to-end']:
        assert claim not in html
