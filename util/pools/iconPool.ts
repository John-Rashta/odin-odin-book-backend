import prisma from "../../config/client";

const iconSource = [
    "https://res.cloudinary.com/dju5ydi5i/image/upload/v1741796276/hu3wbvgacjiu5r1bznxv.png",
    "https://res.cloudinary.com/dju5ydi5i/image/upload/v1741796276/y72z9r0rmyxxwzo7gwhh.png",
    "https://res.cloudinary.com/dju5ydi5i/image/upload/v1741796276/aiqxasidirx7r2hjmdm9.png",
    "https://res.cloudinary.com/dju5ydi5i/image/upload/v1741796277/btwsb7hsrhfafnd7nfhm.png",
    "https://res.cloudinary.com/dju5ydi5i/image/upload/v1741796276/hwaqtgngkka5adg79uvg.png",
    "https://res.cloudinary.com/dju5ydi5i/image/upload/v1741796277/h7jbr2a2arvvjyveb1hn.png",
    "https://res.cloudinary.com/dju5ydi5i/image/upload/v1741796277/hgnqpbqpc9v9msbjokvt.png",
    "https://res.cloudinary.com/dju5ydi5i/image/upload/v1741796277/r667ofhtdodnfqtz6omx.png",
];

const poolMain = async function poolMainDatabase() {

    for (let j = 0; j < iconSource.length; j++) {
        await prisma.icon.create({
            data: {
                source: iconSource[j]
            }
        })
    };
};

poolMain();