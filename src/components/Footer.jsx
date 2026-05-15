export default function Footer(){
  return (
    <footer className="bg-gradient-to-t from-black to-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm">© {new Date().getFullYear()} F1 Sports. All rights reserved.</div>
        <div className="flex gap-4 mt-3 md:mt-0">
          <a href="#" className="link-muted">Privacy</a>
          <a href="#" className="link-muted">Terms</a>
        </div>
      </div>
    </footer>
  )
}
