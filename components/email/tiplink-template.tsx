import React from "react";

interface TipLinkEmailTemplateProps {
  tiplinkUrl: string;
  nftImageUrl: string;
}

export default function TipLinkEmailTemplate({
  tiplinkUrl,
  nftImageUrl,
}: TipLinkEmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        lineHeight: 1.6,
        color: "#333",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f4f4f4",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            color: "#4a4a4a",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Your Collectible is Ready! 🎉
        </h1>
        <img
          src={nftImageUrl}
          alt="Your NFT"
          style={{
            display: "block",
            maxWidth: "100%",
            height: "auto",
            margin: "0 auto 20px",
            borderRadius: "10px",
          }}
        />
        <p>Hey there! Your awesome Collectible is minted and ready to go.</p>
        <a
          href={tiplinkUrl}
          style={{
            display: "block",
            backgroundColor: "#3498db",
            color: "white",
            textDecoration: "none",
            padding: "15px 20px",
            borderRadius: "5px",
            margin: "20px auto",
            textAlign: "center",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Claim Your Collectible
        </a>
        <p>
          This link is your golden ticket to your Collectible. Keep it safe!
        </p>
      </div>
    </div>
  );
}
