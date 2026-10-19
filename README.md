# DeskFlow — IT Help Desk & Troubleshooting Ticket System

A responsive front-end IT service desk demo built with **HTML5, CSS3, and vanilla JavaScript**. Designed as a portfolio project for an IT Support fresher.

## Features

- Dashboard summary cards for total, open, in-progress, and resolved tickets
- Sample support tickets on first launch
- Create tickets with title, requester, category, priority, status, and description
- Search tickets by ID, title, requester, category, or description
- Filter by status, priority, and category
- Update ticket status and priority
- Add troubleshooting notes to each ticket
- View ticket details and troubleshooting history
- Delete tickets with confirmation
- Knowledge base with basic Wi-Fi, printer, slow computer, software, access, and VPN guides
- LocalStorage persistence between refreshes in the same browser
- Responsive layout for desktop, tablet, and mobile
- Form validation and safe HTML escaping for user-provided text
- No framework, build step, database, API key, or paid service required

## Project structure

```text
it-help-desk/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

1. Download or clone this repository.
2. Open the `it-help-desk` folder in Visual Studio Code.
3. Open `index.html` in a browser, or use the free **Live Server** extension in VS Code.
4. Try creating a ticket, changing its priority/status, adding troubleshooting notes, and refreshing the page to confirm persistence.

The app loads Google Fonts when internet access is available; it still works with fallback fonts offline.

## Data and privacy notes

- Tickets are saved in the browser's LocalStorage on the current browser profile and origin.
- Data is not synchronized between users or devices and is not sent to a server.
- Clearing browser site data or using a different browser/origin may remove or hide saved tickets.
- This is a portfolio demonstration, **not a production service desk**. It has no authentication, authorization, backend, database, audit-grade logging, or multi-user access.
- Do not enter real employee records, passwords, MFA codes, confidential information, or company data.

## Suggested manual test checklist

- [ ] Dashboard counts match the ticket list.
- [ ] Create a ticket with all required fields.
- [ ] Try submitting the form with required fields missing.
- [ ] Search by ticket ID, title, and requester.
- [ ] Filter by status, priority, and category, separately and together.
- [ ] Change status and priority in a ticket's detail view.
- [ ] Add a troubleshooting note and confirm it appears in the history.
- [ ] Refresh the browser and confirm tickets remain.
- [ ] Delete a ticket and verify the dashboard updates.
- [ ] Open a knowledge-base guide and create a related ticket.
- [ ] Test the layout at desktop and mobile widths.

## Resume description

**DeskFlow — IT Help Desk & Troubleshooting Ticket System**  
*HTML5, CSS3, JavaScript, LocalStorage, Git, GitHub*

- Developed a responsive IT help desk application to create, categorize, search, and manage support tickets.
- Implemented ticket status and priority management, dashboard summaries, and troubleshooting logs using vanilla JavaScript.
- Used LocalStorage to persist ticket records across browser refreshes.
- Created a knowledge base with safe first-step guides for common network, hardware, software, and access issues.

Add your actual GitHub repository and live demo URLs before including them on your resume. Be prepared to explain the code and its limitations in an interview.

## Publish for free

You can publish this static site using GitHub Pages:

1. Create a GitHub repository (for example, `it-help-desk`).
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. In the repository, open **Settings → Pages**.
4. Select the deployment source/branch according to GitHub Pages' current options, then save.
5. Wait for deployment and open the published URL.
6. Test the live version. LocalStorage on the live URL is separate from LocalStorage on your local file or another origin.

## Future improvements

- Add a backend API and database for shared tickets.
- Add secure authentication and role-based authorization.
- Add server-side validation and audit logs.
- Add SLA due dates, assignment, attachments, and email notifications.
- Add unit tests and accessibility testing.
