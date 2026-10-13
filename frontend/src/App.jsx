import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '')
const API = `${API_BASE_URL}/api/items`
const AUTH_API = `${API_BASE_URL}/api/auth`
const emptyForm = {
  title: '', description: '', category: 'Electronics', location: '',
  contactName: '', contactEmail: '', itemType: 'LOST', status: 'OPEN'
}

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`${AUTH_API}/${mode === 'login' ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { fullName, email, password })
      })
      if (!response.ok) {
        let message = 'Could not complete request.'
        try { const body = await response.json(); message = body.message || body.detail || message } catch {}
        throw new Error(message)
      }
      const account = await response.json()
      sessionStorage.setItem('campusLostAccount', JSON.stringify(account))
      onAuthenticated(account)
    } catch (err) {
      setError(err.message.includes('Failed to fetch')
        ? 'Cannot connect to the backend. Start Spring Boot and check MySQL settings.'
        : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <header className="topbar auth-topbar">
        <a className="brand" href="#"><span className="brand-mark">C</span> campus<span>lost</span></a>
        <span className="auth-top-note">A CAMPUS COMMUNITY PROJECT</span>
      </header>
      <main className="auth-layout">
        <section className="auth-welcome">
          <p className="eyebrow">LOST SOMETHING? FOUND SOMETHING?</p>
          <h1>Good things<br />find their <em>way home.</em></h1>
          <p className="hero-text">Join your campus community to report lost belongings, share found items, and help things get back to their owners.</p>
          <div className="auth-illustration"><div className="auth-sun"></div><div className="auth-ticket">✳<small>FOUND WITH CARE</small></div><div className="auth-orbit">↗</div></div>
          <p className="auth-footnote">A little help goes a long way.</p>
        </section>
        <section className="auth-card">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'chosen' : ''} onClick={() => { setMode('login'); setError('') }}>Log in</button>
            <button className={mode === 'signup' ? 'chosen' : ''} onClick={() => { setMode('signup'); setError('') }}>Sign up</button>
          </div>
          <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN THE COMMUNITY'}</p>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="muted">{mode === 'login' ? 'Log in to continue to Campus Lost.' : 'Use your details to get started.'}</p>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={submit} className="auth-form">
            {mode === 'signup' && <label>Full name<input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required maxLength="100" autoComplete="name" /></label>}
            <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" required autoComplete="email" /></label>
            <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'} required minLength={mode === 'signup' ? 8 : 1} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>
            <button className="submit-button auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in to Campus Lost' : 'Create account'} <span>↗</span></button>
          </form>
          <p className="auth-switch">{mode === 'login' ? "New to Campus Lost?" : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>{mode === 'login' ? 'Sign up' : 'Log in'}</button></p>
          <p className="auth-privacy">Demo starter: use a password you do not use elsewhere.</p>
        </section>
      </main>
      <footer><a className="brand" href="#"><span className="brand-mark">C</span> campus<span>lost</span></a><span>Find it. Share it. Bring it home.</span></footer>
    </div>
  )
}

export default function App() {
  const [account, setAccount] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('campusLostAccount') || 'null') } catch { return null }
  })
  if (!account) return <AuthPage onAuthenticated={setAccount} />
  return <CampusLostHome account={account} onLogout={() => {
    sessionStorage.removeItem('campusLostAccount')
    setAccount(null)
  }} />
}

function CampusLostHome({ account, onLogout }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function loadItems() {
    try {
      const response = await fetch(API)
      if (!response.ok) throw new Error('Could not load items')
      setItems(await response.json())
    } catch {
      setMessage('Cannot connect to backend. Make sure Spring Boot and MySQL are running.')
    }
  }

  useEffect(() => { loadItems() }, [])

  const visibleItems = useMemo(() => items.filter(item => {
    const haystack = `${item.title} ${item.description} ${item.category} ${item.location}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) &&
      (filter === 'ALL' || item.itemType === filter)
  }), [items, search, filter])

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function submitForm(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || 'Could not save item')
      }
      setMessage(editingId ? 'Item updated successfully.' : 'Item posted successfully.')
      setForm(emptyForm)
      setEditingId(null)
      await loadItems()
    } catch (error) {
      setMessage(`Could not save item. ${error.message}`)
    } finally {
      setBusy(false)
    }
  }

  function editItem(item) {
    setEditingId(item.id)
    setForm({
      title: item.title || '', description: item.description || '',
      category: item.category || 'Other', location: item.location || '',
      contactName: item.contactName || '', contactEmail: item.contactEmail || '',
      itemType: item.itemType || 'LOST', status: item.status || 'OPEN'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function markClaimed(item) {
    try {
      const response = await fetch(`${API}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: item.status === 'CLAIMED' ? 'OPEN' : 'CLAIMED' })
      })
      if (!response.ok) throw new Error()
      setMessage(item.status === 'CLAIMED' ? 'Item reopened.' : 'Item marked as claimed.')
      await loadItems()
    } catch {
      setMessage('Could not update item status. Check the backend connection.')
    }
  }

  async function deleteItem(id) {
    if (!window.confirm('Delete this item permanently?')) return
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error()
      setMessage('Item deleted.')
      await loadItems()
    } catch {
      setMessage('Could not delete item.')
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">C</span> campus<span>lost</span></a>
        <div className="nav-actions"><span className="signed-in">Hi, {account.fullName}</span><a className="nav-link" href="#items">Browse items ↗</a><button className="logout-button" onClick={onLogout}>Log out</button></div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">YOUR CAMPUS. YOUR COMMUNITY.</p>
            <h1>Lost something?<br /><em>Find your way back.</em></h1>
            <p className="hero-text">A little help from your campus community can make a lost item feel a little less lost.</p>
            <a className="primary-link" href="#report">Post an item <span>↓</span></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun"></div><div className="art-card card-one">✦<small>FOUND</small></div>
            <div className="art-card card-two">⌕<small>SEARCH</small></div><div className="art-circle">↗</div>
            <div className="art-caption">Good things find<br />their way home.</div>
          </div>
        </section>

        <section className="stats">
          <div><strong>{items.length}</strong><span>Community posts</span></div>
          <div><strong>{items.filter(i => i.itemType === 'LOST').length}</strong><span>Lost items</span></div>
          <div><strong>{items.filter(i => i.itemType === 'FOUND').length}</strong><span>Found items</span></div>
          <div><strong>{items.filter(i => i.status === 'CLAIMED').length}</strong><span>Reunited</span></div>
        </section>

        {message && <div className="notice" role="status">{message}<button onClick={() => setMessage('')} aria-label="Dismiss message">×</button></div>}

        <section className="content-grid" id="report">
          <div className="form-panel">
            <p className="eyebrow">{editingId ? 'MAKE AN UPDATE' : 'HELP THE COMMUNITY'}</p>
            <h2>{editingId ? 'Edit your post' : 'Post an item'}</h2>
            <p className="muted">Share a few details so the right person can find it.</p>
            <form onSubmit={submitForm}>
              <label>Post type
                <div className="type-switch">
                  <button type="button" className={form.itemType === 'LOST' ? 'selected' : ''} onClick={() => setForm({ ...form, itemType: 'LOST' })}>I lost something</button>
                  <button type="button" className={form.itemType === 'FOUND' ? 'selected' : ''} onClick={() => setForm({ ...form, itemType: 'FOUND' })}>I found something</button>
                </div>
              </label>
              <label>Item name *<input name="title" value={form.title} onChange={updateField} placeholder="e.g. Blue water bottle" required maxLength="120" /></label>
              <label>Category *
                <select name="category" value={form.category} onChange={updateField} required>
                  {['Electronics', 'Books & notes', 'ID & cards', 'Clothing', 'Keys', 'Bags', 'Accessories', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Last seen / found at *<input name="location" value={form.location} onChange={updateField} placeholder="e.g. Library, 2nd floor" required maxLength="180" /></label>
              <label>Description *<textarea name="description" value={form.description} onChange={updateField} placeholder="Color, brand, distinguishing details..." rows="3" required maxLength="1500" /></label>
              <div className="two-fields">
                <label>Your name *<input name="contactName" value={form.contactName} onChange={updateField} placeholder="Name" required maxLength="100" /></label>
                <label>Contact email *<input type="email" name="contactEmail" value={form.contactEmail} onChange={updateField} placeholder="you@example.com" required maxLength="180" /></label>
              </div>
              <button className="submit-button" type="submit" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Publish post'} <span>↗</span></button>
              {editingId && <button className="cancel-button" type="button" onClick={cancelEdit}>Cancel editing</button>}
            </form>
          </div>

          <div className="listing-panel" id="items">
            <div className="listing-heading">
              <div><p className="eyebrow">THE COMMUNITY BOARD</p><h2>Recent posts <span className="count">{visibleItems.length}</span></h2></div>
            </div>
            <div className="search-row">
              <span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items, places..." aria-label="Search items" />
            </div>
            <div className="filters">
              {[['ALL', 'All posts'], ['LOST', 'Lost'], ['FOUND', 'Found']].map(([value, label]) =>
                <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>
              )}
            </div>
            <div className="item-list">
              {visibleItems.length === 0 ? <div className="empty-state"><div>⌕</div><h3>No posts found yet</h3><p>Try another search, or be the first to post an item.</p></div> :
                visibleItems.map(item => <article className="item-card" key={item.id}>
                  <div className={`item-icon ${item.itemType.toLowerCase()}`}>{item.itemType === 'LOST' ? '↘' : '✳'}</div>
                  <div className="item-main">
                    <div className="item-labels"><span className={`tag ${item.itemType.toLowerCase()}`}>{item.itemType}</span><span className={`status ${item.status === 'CLAIMED' ? 'claimed' : ''}`}>{item.status === 'CLAIMED' ? 'REUNITED' : 'OPEN'}</span></div>
                    <h3>{item.title}</h3><p>{item.description}</p>
                    <div className="item-meta"><span>⌖ {item.location}</span><span>▦ {item.category}</span></div>
                    <details className="contact-details"><summary>Contact poster</summary><p>{item.contactName} · <a href={`mailto:${item.contactEmail}`}>{item.contactEmail}</a></p></details>
                    <div className="item-actions">
                      <button onClick={() => markClaimed(item)}>{item.status === 'CLAIMED' ? 'Reopen' : 'Mark reunited'}</button>
                      <button onClick={() => editItem(item)}>Edit</button>
                      <button className="delete-action" onClick={() => deleteItem(item.id)}>Delete</button>
                    </div>
                  </div>
                </article>)
              }
            </div>
          </div>
        </section>
      </main>
      <footer><a className="brand" href="#"><span className="brand-mark">C</span> campus<span>lost</span></a><p>Small acts. Found things. Stronger campus.</p><span>Built for your campus community · React + Spring Boot</span></footer>
    </div>
  )
}
