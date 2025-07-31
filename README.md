# 🎬 Cochran Films Job Listings System

> **Atlanta's Premier Creative Team** - Join our dynamic crew of photographers, videographers, and media professionals

[![Cochran Films](https://img.shields.io/badge/Cochran%20Films-Atlanta's%20Media%20Powerhouse-FFB200?style=for-the-badge&logo=film)](https://www.cochranfilms.com)
[![Job Listings](https://img.shields.io/badge/Job%20Listings-Live%20Opportunities-22C55E?style=for-the-badge)](https://jobs.cochranfilms.com)
[![Contact](https://img.shields.io/badge/Contact-(470)%20420--2169-3B82F6?style=for-the-badge)](tel:4704202169)

---

## 🚀 About This System

**Cochran Films** has built an innovative in-house job application system that seamlessly connects talented creatives with exciting opportunities in media production. This dynamic web platform automatically syncs with our Google Sheets database to display real-time job openings, making it effortless for applicants to discover and apply for positions.

### ✨ Key Features

- **🔄 Real-Time Updates**: Automatically syncs with Google Sheets for instant job posting updates
- **📱 Mobile-First Design**: Optimized for all devices with responsive layout
- **🎯 Smart Filtering**: Only displays active job opportunities
- **📝 One-Click Applications**: Pre-filled Google Forms for seamless application process
- **⚡ Lightning Fast**: Cached data and optimized loading for instant results
- **🎨 Brand-Consistent**: Matches Cochran Films' visual identity and aesthetic

---

## 🎯 For Job Seekers

### What We're Looking For

**Cochran Films** is Atlanta's full-stack media powerhouse, specializing in:

- 📸 **Photography**: Event coverage, professional headshots, product photography
- 🎥 **Videography**: Commercial production, event documentation, creative content
- ✂️ **Post-Production**: Video editing, color grading, motion graphics
- 🎪 **Event Coverage**: Weddings, corporate events, live performances
- 🏢 **Commercial Work**: Brand photography, marketing content, advertising

### Why Work With Us?

- **🏆 Premier Reputation**: Atlanta's trusted media production company
- **💼 Competitive Pay**: Industry-leading compensation for skilled professionals
- **🎨 Creative Freedom**: Work on exciting, boundary-pushing projects
- **🤝 Collaborative Environment**: Join a dynamic team of passionate creatives
- **📈 Growth Opportunities**: Build your portfolio with diverse projects

### How to Apply

1. **Browse Opportunities**: Visit our live job listings at `jobs.cochranfilms.com`
2. **Review Details**: Click "More Details" to see full job descriptions
3. **Apply Instantly**: Click "Apply Now" for one-click application process
4. **Stay Updated**: Use the "Refresh Jobs" button to check for new opportunities

---

## 🛠️ Technical Implementation

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Google Sheets │───▶│  Job Listings    │───▶│  Google Forms   │
│   (Database)    │    │  Web System      │    │  (Applications) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Data Source**: Google Sheets API via CSV export
- **Forms**: Google Forms with pre-filled parameters
- **Styling**: Custom CSS with responsive design
- **Performance**: Client-side caching and optimized loading

### Key Technical Features

#### 🔄 Real-Time Data Sync
```javascript
// Multiple URL formats for reliability
const GOOGLE_SHEET_URLS = [
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`
];
```

#### ⚡ Performance Optimizations
- **Client-side caching** (15-second TTL)
- **Parallel URL testing** for fastest response
- **DocumentFragment rendering** for smooth UI updates
- **Progressive loading** with loading states

#### 📱 Responsive Design
```css
/* Mobile-first approach */
@media (max-width: 768px) {
  .jobs-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .jobs-grid { grid-template-columns: 1fr; }
}
```

### Data Structure

The system expects Google Sheets with these columns:
- **Title**: Job position name
- **Date**: Event or project date
- **Location**: Work location
- **Pay**: Compensation details
- **Description**: Full job description
- **Status**: "Active" for visible jobs

---

## 🎨 Design System

### Brand Colors
```css
:root {
  --primary: #FFB200;      /* Cochran Films Gold */
  --primary-dark: #FF9000; /* Darker Gold */
  --gold: #FFD700;         /* Bright Gold */
  --black: #000000;        /* Pure Black */
  --white: #ffffff;        /* Pure White */
}
```

### Typography
- **Headings**: Cinzel (serif) - Premium, elegant feel
- **Body**: Inter (sans-serif) - Modern, readable

### Visual Elements
- **Gradient backgrounds** with brand gold accents
- **Smooth animations** and hover effects
- **Card-based layout** for job listings
- **Consistent spacing** and visual hierarchy

---

## 🚀 Getting Started

### For Developers

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/cochran-films-job-system.git
   cd cochran-films-job-system
   ```

2. **Configure Google Sheets**
   - Create a Google Sheet with the required columns
   - Set sharing permissions to "Anyone with link can view"
   - Update the `SHEET_ID` in `Job-Listings.html`

3. **Configure Google Forms**
   - Create a Google Form for job applications
   - Update the `BASE_FORM_URL` and field IDs in the JavaScript

4. **Deploy**
   - Upload to your web server
   - Ensure all assets (images, fonts) are accessible

### For Business Users

1. **Add Job Listings**
   - Open your Google Sheet
   - Add new rows with job details
   - Set status to "Active" for visible jobs

2. **Monitor Applications**
   - Check your Google Form responses
   - Review applicant information
   - Contact qualified candidates

---

## 📊 System Benefits

### For Cochran Films
- **🎯 Targeted Recruitment**: Reach qualified creatives in Atlanta
- **⚡ Instant Updates**: Post jobs without technical overhead
- **📈 Scalable**: Handle growing hiring needs efficiently
- **💼 Professional Image**: Showcase company through branded interface
- **📊 Easy Management**: Centralized job and application tracking

### For Applicants
- **🔍 Easy Discovery**: Browse all opportunities in one place
- **⚡ Quick Application**: One-click apply with pre-filled forms
- **📱 Mobile Access**: Apply from any device
- **🔄 Real-Time Updates**: See new jobs as they're posted
- **🎯 Relevant Opportunities**: Filtered for active positions only

---

## 🔧 Customization

### Branding Updates
- Update logo files (`Logo.png`, `Favicon.png`)
- Modify color scheme in CSS variables
- Adjust typography in font imports

### Feature Enhancements
- Add job categories and filtering
- Implement email notifications
- Add application tracking dashboard
- Integrate with CRM systems

---

## 📞 Contact & Support

**Cochran Films**  
📍 Atlanta, Georgia  
📞 [(470) 420-2169](tel:4704202169)  
🌐 [www.cochranfilms.com](https://www.cochranfilms.com)  
📧 [info@cochranfilms.com](mailto:info@cochranfilms.com)

### Technical Support
For technical issues or feature requests, please contact our development team or create an issue in this repository.

---

## 📄 License

This project is proprietary to **Cochran Films**. All rights reserved.

---

<div align="center">

**Built with ❤️ by the Cochran Films Team**

*Empowering Atlanta's creative community through innovative technology*

[![Cochran Films](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%20by-Cochran%20Films-FFB200?style=for-the-badge)](https://www.cochranfilms.com)

</div> 
