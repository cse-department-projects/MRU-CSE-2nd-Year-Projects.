# Rural One – Complete Frontend

Professional multi-page frontend for a Java Spring Boot + MySQL college project.

## Theme
- Primary Green: `#1B5E20`
- Fresh Green: `#66BB6A`
- Golden Yellow: `#F9A825`
- Soft Cream: `#F7F9F2`
- Dark Charcoal: `#263238`

## Pages (19)

| File | Description |
|------|-------------|
| index.html | Home – hero, stats, services |
| about.html | About, objectives, benefits |
| citizens.html | Registration, services, documents |
| farmers.html | Crops, equipment, tips, registration |
| schemes.html | Scheme cards + search/filter |
| complaints.html | Submit + track with status badges |
| jobs.html | Job cards + filters |
| weather.html | Current weather + 5-day + farmer advice |
| calendar.html | Village events calendar + upcoming list |
| shg.html | SHG groups, savings, meetings |
| residents.html | Population, age chart, households |
| dashboard.html | Admin sidebar + cards + Chart.js |
| announcements.html | Notices + category filters |
| health-services.html | PHC, staff, camps, emergency |
| feedback.html | Star rating + form + recent reviews |
| contact.html | Office info + form |
| profile.html | User profile card + activity |
| settings.html | Account, notifications, language, privacy |
| login.html | Role tabs (Admin/Citizen/Farmer) |

## Spring Boot placement

Copy contents into:

```
src/main/resources/static/
  css/style.css
  js/script.js
  index.html
  about.html
  ... (all other HTML files)
```

Or use Thymeleaf templates under `templates/` and keep CSS/JS in `static/`.

## How to open

```bash
cd rural-ms-v2
python -m http.server 5500
# Open http://localhost:5500
```

## Tech
- HTML5 + CSS3 (custom)
- Vanilla JavaScript
- Bootstrap Icons (CDN)
- Chart.js (dashboard & residents)
- Unsplash images (rural/agriculture/health)

## Notes
- Forms are demo mode (alert on submit).
- Ready to wire to Spring Boot REST APIs with `fetch()`.
