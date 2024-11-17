import Image from "next/image"

export const Usp = () => {
    return (
        <div className="px-4 sm:px-6 lg:px-48 py-12 md:py-24 bg-white" >
            <div className="text-3xl md:text-5xl font-semibold mb-4">Probo takes care of you,</div>
            <div className="text-3xl md:text-5xl font-semibold mb-8">so you take care of your trades.</div>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-y-8">
                    <Image
                        width={60}
                        height={60}
                        src='/globe.png'
                        alt="globe"
                        className="mb-8"
                    />
                    <div className="md:text-lg font-semibold">Fastest news feed in the game</div>
                    <div>Probo is all about understanding the world around us and bene fitting from our knowledge. Everything on Probo is based on real events that you can learn about, verify and follow yourself.</div>
                </div>
                <div className="flex flex-col gap-y-8">
                    <Image
                        width={60}
                        height={60}
                        src='/funnel.png'
                        alt="funnel"
                        className="mb-8"
                    />
                    <div className="md:text-lg font-semibold">All the news without the noise</div>
                    <div>Our experts go through tons of information to get to the very core of a world event. They help you develop not only an opinion about events but also a better understanding of the world around us.</div>
                </div>
                <div className="flex flex-col gap-y-8">
                    <Image
                        width={60}
                        height={60}
                        src='/power.png'
                        alt="power"
                        className="mb-8"
                    />
                    <div className="md:text-lg font-semibold">The power to exit trades, anytime</div>
                    <div>Probo is an opinion trading platform. And, like a true trading platform, Probo gives you the power to exit. You can withdraw from a trade, if it’s not going in the direction you thought it will go.</div>
                </div>
                <div className="flex flex-col gap-y-8">
                    <Image
                        width={60}
                        height={60}
                        src='/eighteen.png'
                        alt="eighteen"
                        className="mb-8"
                    />
                    <div className="md:text-lg font-semibold">The pulse of society is on Probo</div>
                    <div>Besides helping you learn important financial & trading skills, Probo also helps you understand the collective thoughts of Indians. Knowledge that is crucial for the betterment of our country.</div>
                </div>
            </div>
        </div>
    )
}