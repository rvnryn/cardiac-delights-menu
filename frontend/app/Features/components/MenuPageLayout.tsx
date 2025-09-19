import Navbar from "./navigation/page";
import Image from "next/image";

interface MenuItem {
  name: string;
  price: number;
  image: string;
  description: string;
}

interface MenuPageLayoutProps {
  title: string;
  description: string;
  items: MenuItem[];
  sections?: {
    title: string;
    items: MenuItem[];
  }[];
  bottomSection: {
    title: string;
    description: string;
    badges: string[];
  };
}

export default function MenuPageLayout({
  title,
  description,
  items,
  sections,
  bottomSection
}: MenuPageLayoutProps) {
  const renderMenuGrid = (menuItems: MenuItem[], startIndex: number = 0) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {menuItems.map((item, index) => (
        <article
          key={index}
          className="group bg-primary-dark rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 animate-slide-up h-full"
          style={{ animationDelay: `${(startIndex + index) * 50}ms` }}
        >
          {/* Image Container */}
          <div className="relative overflow-hidden aspect-[4/3]">
            <Image
              src={item.image}
              alt={`${item.name} - ${item.description}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>
            
            {/* Price Badge */}
            <div className="absolute top-3 right-3 bg-primary-yellow text-primary-dark px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
              ₱{item.price}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 md:p-6 flex flex-col h-full">
            <div className="text-center mb-4 flex-grow">
              <h3 className="font-bold text-lg md:text-xl text-primary-yellow leading-tight mb-3">
                {item.name}
              </h3>

              <p className="text-xs md:text-sm text-primary-yellow/80 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>

            {/* Action Area */}
            <div className="pt-4 border-t border-primary-yellow/20 mt-auto">
              <div className="flex items-center justify-between">
                <div className="text-lg md:text-xl font-bold text-primary-yellow">
                  ₱{item.price}
                </div>
                <button className="bg-primary-yellow text-primary-dark px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-primary-yellow/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 focus:ring-offset-primary-dark">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-yellow">
      <Navbar />
      
      {/* Page Header */}
      <section className="py-fluid-lg lg:py-fluid-xl">
        <div className="container-fluid">
          {/* Header */}
          <div className="text-center mb-fluid-xl animate-fade-in">
            <h1 className="text-fluid-4xl md:text-fluid-5xl lg:text-fluid-6xl font-bold text-primary-dark leading-tight mb-fluid-md">
              {title}
            </h1>

            <div className="flex justify-center mb-fluid-md">
              <div className="w-24 md:w-32 lg:w-40 h-1 bg-primary-dark rounded-full"></div>
            </div>

            <p className="text-fluid-lg md:text-fluid-xl text-primary-dark/90 max-w-3xl mx-auto leading-relaxed mb-fluid-md">
              {description}
            </p>

            <div className="inline-flex items-center gap-2 bg-primary-dark/10 backdrop-blur-sm rounded-full px-6 py-3 text-fluid-sm text-primary-dark/80">
              {sections ? sections.reduce((total, section) => total + section.items.length, 0) : items.length} Options Available
            </div>
          </div>

          {/* Menu Content */}
          {sections ? (
            // Multiple sections layout
            sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-16">
                <h2 className="text-2xl lg:text-3xl font-bold text-primary-dark text-center mb-8">
                  {section.title}
                </h2>
                {renderMenuGrid(section.items, sectionIndex * 10)}
              </div>
            ))
          ) : (
            // Single section layout
            <div className="mb-16">
              {renderMenuGrid(items)}
            </div>
          )}

          {/* Bottom Section */}
          <div className="text-center animate-fade-in">
            <div className="bg-primary-dark/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-primary-dark mb-4">
                {bottomSection.title}
              </h3>
              <p className="text-base text-primary-dark/80 leading-relaxed mb-6">
                {bottomSection.description}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {bottomSection.badges.map((badge, index) => (
                  <span 
                    key={index}
                    className="bg-primary-dark text-primary-yellow px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
