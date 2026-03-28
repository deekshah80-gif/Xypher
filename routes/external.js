// routes/external.js  — M4: External Job Platform Integration
// Fetches live internships/jobs from JSearch (RapidAPI) — which covers
// LinkedIn, Indeed, Glassdoor, Internshala-style listings.
// Falls back to curated seed data if API key is not set.

const express = require('express');
const router = express.Router();

// ── Seed data (always available, no API key needed) ──────────────
const SEED_JOBS = [
  {
    id: 'seed-1', source: 'Internshala',
    title: 'Software Developer Intern', company: 'Razorpay',
    location: 'Bengaluru (Remote)', stipend: '₹35,000/mo',
    duration: '3 months', deadline: '2025-08-15',
    link: 'https://internshala.com/internship/detail/software-developer-intern',
    skills: ['React', 'Node.js', 'JavaScript'], type: 'internship',
  },
  {
    id: 'seed-2', source: 'Internshala',
    title: 'Data Science Intern', company: 'Swiggy',
    location: 'Bengaluru', stipend: '₹30,000/mo',
    duration: '6 months', deadline: '2025-07-30',
    link: 'https://internshala.com/internship/detail/data-science-intern',
    skills: ['Python', 'ML', 'SQL'], type: 'internship',
  },
  {
    id: 'seed-3', source: 'Internshala',
    title: 'UI/UX Design Intern', company: 'Meesho',
    location: 'Remote', stipend: '₹25,000/mo',
    duration: '2 months', deadline: '2025-09-01',
    link: 'https://internshala.com/internship/detail/ui-ux-design-intern',
    skills: ['Figma', 'Prototyping', 'CSS'], type: 'internship',
  },
  {
    id: 'seed-4', source: 'LinkedIn',
    title: 'Backend Engineer', company: 'Zepto',
    location: 'Mumbai', salary: '₹18 LPA',
    link: 'https://linkedin.com/jobs/view/backend-engineer-zepto',
    skills: ['Go', 'Kafka', 'Docker'], type: 'full-time',
  },
  {
    id: 'seed-5', source: 'LinkedIn',
    title: 'Product Manager', company: 'CRED',
    location: 'Bengaluru', salary: '₹24 LPA',
    link: 'https://linkedin.com/jobs/view/product-manager-cred',
    skills: ['Agile', 'Analytics', 'SQL'], type: 'full-time',
  },
  {
    id: 'seed-6', source: 'LinkedIn',
    title: 'ML Engineer', company: 'Flipkart',
    location: 'Bengaluru', salary: '₹22 LPA',
    link: 'https://linkedin.com/jobs/view/ml-engineer-flipkart',
    skills: ['Python', 'TensorFlow', 'Kubernetes'], type: 'full-time',
  },
  {
    id: 'seed-7', source: 'Internshala',
    title: 'Full Stack Developer Intern', company: 'OYO',
    location: 'Gurugram', stipend: '₹20,000/mo',
    duration: '3 months', deadline: '2025-08-20',
    link: 'https://internshala.com/internship/detail/full-stack-developer-intern',
    skills: ['React', 'Django', 'PostgreSQL'], type: 'internship',
  },
  {
    id: 'seed-8', source: 'LinkedIn',
    title: 'DevOps Engineer', company: 'Ola',
    location: 'Bengaluru', salary: '₹14 LPA',
    link: 'https://linkedin.com/jobs/view/devops-engineer-ola',
    skills: ['AWS', 'Kubernetes', 'Linux', 'Terraform'], type: 'full-time',
  },
];

// ── GET /external/jobs ────────────────────────────────────────────
// Query params:
//   q      — keyword search (title, company, skills)
//   source — 'internshala' | 'linkedin' | 'all' (default: all)
//   type   — 'internship' | 'full-time' | 'all' (default: all)
router.get('/jobs', async (req, res) => {
  try {
    const { q = '', source = 'all', type = 'all' } = req.query;
    let jobs = [...SEED_JOBS];
    let dataSource = 'seed';

    // ── Live data via JSearch (RapidAPI) if key is set ────────────
    if (process.env.JSEARCH_API_KEY) {
      try {
        const query = q || 'software engineer intern india';
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=in`;

        // Use node-fetch v2 syntax (commonjs compatible)
        const fetch = (...args) =>
          import('node-fetch').then(({ default: f }) => f(...args));

        const resp = await fetch(url, {
          headers: {
            'X-RapidAPI-Key': process.env.JSEARCH_API_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
          },
        });

        if (resp.ok) {
          const data = await resp.json();
          const liveJobs = (data.data || []).slice(0, 10).map((j, i) => ({
            id: `live-${i}`,
            source: 'JSearch',
            title: j.job_title,
            company: j.employer_name,
            location: [j.job_city, j.job_country].filter(Boolean).join(', '),
            salary: j.job_min_salary
              ? `${j.job_salary_currency || '₹'}${j.job_min_salary}–${j.job_max_salary}`
              : 'Not disclosed',
            type: j.job_employment_type === 'INTERN' ? 'internship' : 'full-time',
            deadline: j.job_offer_expiration_datetime_utc?.split('T')[0] || null,
            link: j.job_apply_link,
            skills: j.job_required_skills || [],
            description: (j.job_description || '').slice(0, 180) + '...',
          }));
          jobs = [...liveJobs, ...SEED_JOBS];
          dataSource = 'live';
        }
      } catch (apiErr) {
        // Fall through to seed data silently
        console.warn('[external/jobs] Live API failed, using seed:', apiErr.message);
      }
    }

    // ── Filters ───────────────────────────────────────────────────
    if (source !== 'all') {
      const sl = source.toLowerCase();
      jobs = jobs.filter(j => j.source.toLowerCase().includes(sl));
    }
    if (type !== 'all') {
      jobs = jobs.filter(j => j.type === type);
    }
    if (q) {
      const ql = q.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(ql) ||
        j.company.toLowerCase().includes(ql) ||
        (j.skills || []).some(s => s.toLowerCase().includes(ql))
      );
    }

    res.json({ source: dataSource, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
