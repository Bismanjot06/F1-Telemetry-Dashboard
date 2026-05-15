export default function Hero(){
  return (
    <section className="bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-6 py-28 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Feel the Speed of F1</h1>
        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">Latest news, teams and driver stats — built with passion for motorsport fans.</p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="#" className="px-6 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 shadow-lg">Explore</a>
          <a href="#" className="px-6 py-3 border border-gray-700 text-gray-200 rounded-md hover:bg-gray-800">Get Updates</a>
        </div>
      </div>
    </section>
  )
}
