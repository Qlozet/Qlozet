import React from "react";
import partnerImage from "../../public/assets/svg/partner1.svg"


const BrandPartners = () => {
    const brandLogos = [
        partnerImage,
        partnerImage,
        partnerImage,
        partnerImage,
        partnerImage,
        partnerImage,
        partnerImage,
        partnerImage,
    ];

    return (
        <div className="py-10 text-center">
            <h2 className="text-[46px] font-semibold mb-6">Some of Our Brand Partners</h2>
            <div className="overflow-x-auto whitespace-nowrap">
                <div className="flex space-x-6 md:justify-center">
                    {brandLogos.map((logo, index) => (
                        <img
                            key={index}
                            src={logo.src}
                            alt={`Brand ${index + 1}`}
                            className="h-12 md:h-16 object-contain"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrandPartners;
