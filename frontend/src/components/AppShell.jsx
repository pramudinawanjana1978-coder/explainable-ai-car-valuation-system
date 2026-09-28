import Sidebar from './Sidebar'

/**
 * Shared layout for every protected page: the floating sidebar plus a
 * content column. Replaces the old top Navbar + .page wrapper — pages
 * just render their existing content as children.
 */
function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  )
}

export default AppShell
