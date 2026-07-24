import Image from 'next/image';
import Link from 'next/link';
import { About1, About2, About3Hero } from '../assets';
import { Heart, Package, Star, Clock } from 'lucide-react';

export default function CheckoutPage() {
    return (
        <section className="bg-white text-gray-900 font-sans">
      <div className="container mx-auto px-6 py-16 md:py-24 max-w-7xl">
        
        {/* HERO SECTION / TITLE */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-sm font-semibold text-orange-600 uppercase tracking-widest bg-orange-100 px-4 py-1 rounded-full">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight">
            Nourishing Every <span className="text-orange-500">Purr</span> Across Oman
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            At PUREMEOWS Pet, your ultimate online destination of pet essentials, we are on a mission to make your pets dreams come true—one purr, bark, or chirp at a time.
          </p>
        </div>

        {/* EMOTIONAL STORY SECTION */}
        <div className="grid md:grid-cols-12 gap-12 items-center mb-24">
          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <Image 
                src={About1}
                alt="A beautiful happy cat in Muscat, Oman"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-yellow-400 w-24 h-24 rounded-full -z-10 opacity-70"></div>
          </div>
          
          <div className="md:col-span-7 space-y-6">
            <h2 className="text-3xl font-bold text-gray-950">A Whimsical Haven Born From a Dream</h2>
            <div className="text-gray-700 space-y-4 text-lg leading-relaxed">
              <p>
                Once upon a time, in a world filled with fluff, fur, and feathers, Hasnan had a dream.
              </p>
              <p className="italic border-l-4 border-orange-300 pl-4 text-gray-600">
                A dream where pets ruled the land and were showered with love, care, and all the delightful goodies they could ever desire.
              </p>
              <p>
                And thus, <strong className="font-semibold text-orange-600">PUREMEOWS Pet</strong> was born—a whimsical haven for all things pet-tastic! We know that pets are not just animals; they are family.
              </p>
            </div>
            <div className="pt-4">
                <Link href="/">
                    <button className="bg-orange-500 text-white font-semibold px-8 py-3 rounded-full shadow hover:bg-orange-600 transition duration-300">
                        Shop Cat Favorites
                    </button>
                </Link>
            </div>
          </div>
        </div>

        {/* WHAT WE OFFER SECTION */}
        <div className="mb-24 bg-gray-50 p-10 md:p-16 rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950">More Than Just a Pet Store</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              We tirelessly search for the best products to make tails wag, beaks chirp, and whiskers twitch with delight.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Pet Food Delights", desc: "From kibble to gourmet treats, our selection will have your pets drooling with anticipation at mealtime.", icon: '🍖' },
              { title: "Pet Accessories Galore", desc: "Dress your furry friends in style with our adorable collars, comfy beds, and fabulous attire.", icon: '🎉' },
              { title: "Pet Toys for Days", desc: "Keep your pets entertained with toys that'll have them chasing, pouncing, and playing all day long.", icon: '🎾' },
              { title: "Health & Hygiene Sanctuary", desc: "Discover a world of health and hygiene solutions where furry well-being meets cleanliness and care.", icon: '💊' }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-950">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PROMISE AND LOGISTICS */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-950 mb-6">Our Promise to You and Your Companion</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Step into PUREMEOWS Pet, your ultimate online destination for all your furry, feathery, and fabulous companions 🐶🐱🦜.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
              {[
                { name: "Tailored Selection", desc: "Customize a pet product box as unique as your furry friend!", icon: Package },
                { name: "Budget-Friendly Options", desc: "Customize without compromise for every pet parent.", icon: Star },
                { name: "Subscription Benefits", desc: "Regular deliveries, exclusive discounts, and more.", icon: Heart },
                { name: "Swift Home Delivery", desc: "Real-time tracking and reliable doorstep delivery across Oman.", icon: Clock },
              ].map((benefit) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={benefit.name} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-orange-100 p-3 rounded-full text-orange-600">
                      <IconComponent className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-950">{benefit.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-xl md:mt-12 min-h-[300px]">
            <Image 
              src={About2}
              alt="A pampered Omani cat resting comfortably"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="bg-orange-600 text-white rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
             <Image 
               src={About3Hero} 
               alt="Background pattern" 
               fill
               className="object-cover"
             />
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold">Ready to make their day?</h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Shop at PUREMEOWS Pet and embark on a pet-tastic journey like no other! Subscribe today and lets make tails wag, feathers fly, and whiskers twitch together!
            </p>
            <div className="pt-6">
                <Link href="/">
                    <button className="bg-white text-orange-600 font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:bg-gray-100 transition duration-300">
                        Explore the Cat Shop Now 🐾
                    </button>
                </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
    );
};
