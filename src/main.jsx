import { render } from 'preact';
import { lazy, Suspense } from 'preact/compat';
import './style.css';
import Student from './Student.jsx';
const Admin = lazy(() => import('./Admin.jsx')); // students never download admin code
const root = document.getElementById('root'); root.textContent = '';
render(location.pathname.startsWith('/admin') ? <Suspense fallback={<main><p className="muted">Loading…</p></main>}><Admin /></Suspense> : <Student />, root);
