"use client";

export default function BrainSVG() {
  return (
    <svg
      width="520"
      height="460"
      viewBox="0 0 520 460"
      fill="none"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 0.06,
        pointerEvents: "none",
        animation: "brain-pulse 4s ease-in-out infinite",
      }}
    >
      {/* Left hemisphere outer */}
      <path
        d="M250,42 C218,42 188,52 164,70 C140,88 120,112 108,140 C96,168 90,198 88,228 C86,258 88,288 96,314 C104,340 118,362 138,380 C158,398 182,410 208,418 C224,423 240,426 250,428"
        stroke="#4ade80"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Right hemisphere outer */}
      <path
        d="M250,42 C282,42 312,52 336,70 C360,88 380,112 392,140 C404,168 410,198 412,228 C414,258 412,288 404,314 C396,340 382,362 362,380 C342,398 318,410 292,418 C276,423 260,426 250,428"
        stroke="#4ade80"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Central fissure */}
      <path
        d="M250,48 C252,80 248,120 250,160 C252,200 248,240 250,280 C252,320 248,360 250,400"
        stroke="#4ade80"
        strokeWidth="0.8"
        opacity="0.5"
      />

      {/* Left hemisphere sulci (folds) */}
      <path
        d="M180,80 C160,100 148,128 150,160"
        stroke="#4ade80"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M145,120 C128,148 118,180 122,216"
        stroke="#4ade80"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <path
        d="M200,100 C178,140 170,180 176,224"
        stroke="#4ade80"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M110,180 C108,210 112,242 126,270"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <path
        d="M160,190 C148,220 144,254 152,286"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.35"
      />
      <path
        d="M220,150 C200,190 195,230 204,270"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.3"
      />
      {/* Left frontal lobe curve */}
      <path
        d="M134,160 C170,170 200,168 240,162"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.25"
      />
      {/* Left parietal curve */}
      <path
        d="M110,260 C140,252 180,256 230,264"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.25"
      />
      {/* Left temporal lower */}
      <path
        d="M130,310 C158,330 190,342 224,346"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Right hemisphere sulci (folds) */}
      <path
        d="M320,80 C340,100 352,128 350,160"
        stroke="#4ade80"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M355,120 C372,148 382,180 378,216"
        stroke="#4ade80"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <path
        d="M300,100 C322,140 330,180 324,224"
        stroke="#4ade80"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M390,180 C392,210 388,242 374,270"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <path
        d="M340,190 C352,220 356,254 348,286"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.35"
      />
      <path
        d="M280,150 C300,190 305,230 296,270"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.3"
      />
      {/* Right frontal lobe curve */}
      <path
        d="M366,160 C330,170 300,168 260,162"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.25"
      />
      {/* Right parietal curve */}
      <path
        d="M390,260 C360,252 320,256 270,264"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.25"
      />
      {/* Right temporal lower */}
      <path
        d="M370,310 C342,330 310,342 276,346"
        stroke="#4ade80"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Brain stem */}
      <path
        d="M236,400 C238,420 242,438 250,452 C258,438 262,420 264,400"
        stroke="#4ade80"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M250,428 L250,455"
        stroke="#4ade80"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Cerebellum hint */}
      <path
        d="M210,395 C220,408 240,414 250,414 C260,414 280,408 290,395"
        stroke="#4ade80"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <path
        d="M220,402 C234,410 246,412 250,412 C254,412 266,410 280,402"
        stroke="#4ade80"
        strokeWidth="0.4"
        opacity="0.25"
      />
    </svg>
  );
}
