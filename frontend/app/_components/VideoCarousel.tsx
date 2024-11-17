'use client'
import { useEffect, useState, useCallback } from "react"

const sections = [
    {
        id: 0,
        title: 'Samachaar',
        heading: 'Be in the know',
        subheading: 'From Sports to Entertainment, Economy, Finance and more. Keep an eye on events in your field of interest.'
    },
    {
        id: 1,
        title: 'Vichaar',
        heading: 'Use what you know',
        subheading: 'Build your knowledge and form your opinions and views about upcoming events in the world.'
    },
    {
        id: 2,
        title: 'Vyapaar',
        heading: 'Trade and grow',
        subheading: 'Invest in your opinions about future events and use your knowledge to trade & benefit.'
    }
]

export const VideoCarousel = () => {
    const [activeSection, setActiveSection] = useState(0);

    const nextSection = useCallback(() => {
        setActiveSection((prev) => (prev + 1) % sections.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(nextSection, 12000);
        return () => clearInterval(timer);
    }, [nextSection]);

    return (
        <div className="bg-black px-10 lg:px-48 py-6 flex gap-x-[200px] items-center w-full rounded-t-2xl min-h-[400px]">
            <div className="space-y-6 md:w-1/2">
                <div className="flex gap-8 items-center">
                    {sections.map((section, index) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(index)}
                            className={`text-2xl md:text-4xl lg:text-6xl transition-colors duration-300 ${activeSection === index ? "text-white" : "text-gray-500"
                                }`}
                        >
                            {section.title}
                        </button>
                    ))}
                </div>
                <div className="space-y-6">
                    <h2 className="text-white text-lg md:text-2xl lg:text-4xl font-semibold">
                        {sections[activeSection].heading}
                    </h2>
                    <p className="text-white text-lg md:text-2xl lg:text-4xl">
                        {sections[activeSection].subheading}
                    </p>
                </div>
            </div>
            <div className="hidden md:block">
                <video
                    width={300}
                    height={300}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="rounded-3xl"
                >
                    <source src="https://d39axbyagw7ipf.cloudfront.net/videos/info-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    )
}