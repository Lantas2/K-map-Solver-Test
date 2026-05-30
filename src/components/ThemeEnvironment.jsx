const bubbles = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
const particles = Array.from({ length: 12 }, (_, index) => index);
const fireflies = Array.from({ length: 12 }, (_, index) => index);
const fallingLeaves = Array.from({ length: 8 }, (_, index) => index);
const petals = Array.from({ length: 12 }, (_, index) => index);

function OceanEnvironment() {
  return (
    <>
      <svg className="ocean-rays" viewBox="0 0 1200 680" preserveAspectRatio="none" focusable="false">
        <path className="ocean-ray ray-a" d="M164 -34 L364 -34 L626 680 L514 680 Z" />
        <path className="ocean-ray ray-b" d="M412 -34 L528 -34 L782 680 L686 680 Z" />
        <path className="ocean-ray ray-c" d="M680 -34 L770 -34 L920 680 L850 680 Z" />
      </svg>
      <svg className="ocean-caustics" viewBox="0 0 1200 600" preserveAspectRatio="none" focusable="false">
        <path d="M18 116 C140 26 204 190 336 103 S574 101 700 177 S962 168 1178 73" />
        <path d="M34 260 C166 174 269 320 394 248 S628 218 754 290 S1007 306 1172 208" />
        <path d="M20 438 C170 346 264 478 410 403 S690 381 804 444 S1040 492 1186 394" />
      </svg>
      <div className="ocean-particles">
        {particles.map((item) => <i key={item} className={`ocean-particle particle-${item}`} />)}
      </div>
      <div className="ocean-bubbles">
        {bubbles.map((item) => <i key={item} className={`ocean-bubble bubble-${item}`} />)}
      </div>
      <svg className="ocean-waves" viewBox="0 0 1200 190" preserveAspectRatio="none" focusable="false">
        <path className="ocean-wave wave-a" d="M0 100 C164 20 284 154 450 90 S776 32 918 106 S1084 148 1200 82 L1200 190 L0 190Z" />
        <path className="ocean-wave wave-b" d="M0 127 C124 69 292 169 438 117 S710 84 870 139 S1054 158 1200 114 L1200 190 L0 190Z" />
      </svg>
      <svg className="ocean-reef" viewBox="0 0 320 360" focusable="false">
        <path className="reef-stem" d="M58 350 C56 292 49 241 68 190 C88 138 73 93 91 36" />
        <path className="reef-stem reef-b" d="M102 350 C108 278 137 242 121 182 C107 130 151 102 160 47" />
        <path className="reef-stem reef-c" d="M174 350 C170 290 199 264 207 216 C218 153 202 107 234 59" />
        <path className="reef-coral" d="M252 349 V295 C245 272 225 276 220 256 M252 302 C267 278 288 286 294 258 M252 323 C265 306 278 313 285 298" />
      </svg>
    </>
  );
}

function ForestEnvironment() {
  return (
    <>
      <svg className="forest-rays" viewBox="0 0 1200 680" preserveAspectRatio="none" focusable="false">
        <path d="M72 -24 L210 -24 L420 680 L314 680Z" />
        <path d="M264 -24 L344 -24 L572 680 L505 680Z" />
        <path d="M914 -24 L1016 -24 L860 680 L786 680Z" />
      </svg>
      <svg className="forest-canopy" viewBox="0 0 1200 320" preserveAspectRatio="none" focusable="false">
        <path d="M0 0 H1200 V82 C1108 122 1026 59 924 93 C813 130 762 56 652 105 C541 152 476 65 368 104 C224 157 144 70 0 121Z" />
      </svg>
      <svg className="forest-vine" viewBox="0 0 360 820" focusable="false">
        <path className="vine-stem" d="M42 818 C67 655 63 443 145 313 C196 232 257 177 291 34" />
        <path className="vine-leaf" d="M96 584 C35 553 23 497 48 450 C126 453 151 530 96 584Z" />
        <path className="vine-leaf" d="M134 447 C161 374 212 345 274 348 C265 423 202 465 134 447Z" />
        <path className="vine-leaf" d="M185 305 C149 245 163 188 211 152 C259 214 246 279 185 305Z" />
      </svg>
      <div className="forest-fireflies">
        {fireflies.map((item) => <i key={item} className={`firefly firefly-${item}`} />)}
      </div>
      <div className="forest-falling-leaves">
        {fallingLeaves.map((item) => <i key={item} className={`falling-leaf leaf-${item}`} />)}
      </div>
      <svg className="forest-floor" viewBox="0 0 360 240" focusable="false">
        <path className="fern-stem" d="M50 238 C62 187 74 124 96 68" />
        <path className="fern-leaf" d="M68 177 C36 157 28 139 29 121 C56 127 71 143 68 177Z" />
        <path className="fern-leaf" d="M79 146 C104 119 127 111 145 112 C137 137 112 152 79 146Z" />
        <path className="fern-leaf" d="M88 116 C67 93 63 72 67 55 C90 65 100 88 88 116Z" />
        <path className="fern-stem second" d="M170 238 C185 188 217 151 253 118" />
        <path className="fern-leaf second" d="M195 184 C164 180 147 166 138 150 C164 145 190 156 195 184Z" />
        <path className="fern-leaf second" d="M215 158 C230 128 252 112 272 107 C273 135 249 155 215 158Z" />
      </svg>
    </>
  );
}

function CoffeeEnvironment() {
  return (
    <>
      <svg className="coffee-rings" viewBox="0 0 520 520" focusable="false">
        <circle cx="245" cy="250" r="176" />
        <circle cx="245" cy="250" r="147" />
        <circle cx="245" cy="250" r="116" />
        <path d="M72 258 C103 162 187 87 287 77" />
      </svg>
      <svg className="coffee-steam" viewBox="0 0 390 700" focusable="false">
        <path className="steam-a" d="M92 658 C35 541 185 472 116 333 C53 210 147 112 201 34" />
        <path className="steam-b" d="M203 684 C137 552 297 487 224 341 C163 218 261 122 312 55" />
        <path className="steam-c" d="M153 671 C104 583 232 518 179 417 C134 333 197 255 238 190" />
      </svg>
      <div className="coffee-bokeh">
        <i className="bokeh bokeh-a" /><i className="bokeh bokeh-b" /><i className="bokeh bokeh-c" /><i className="bokeh bokeh-d" />
      </div>
      <svg className="coffee-cup" viewBox="0 0 240 230" focusable="false">
        <ellipse className="cup-shadow" cx="112" cy="204" rx="89" ry="12" />
        <path className="cup-body" d="M42 71 H166 V137 C166 177 134 195 104 195 C72 195 42 176 42 137Z" />
        <path className="cup-handle" d="M165 89 C221 80 224 157 170 157" />
        <ellipse className="cup-coffee" cx="104" cy="74" rx="62" ry="14" />
        <path className="cup-crema" d="M71 72 C85 60 116 62 134 71 C123 81 86 84 71 72Z" />
      </svg>
    </>
  );
}

function RoseEnvironment() {
  return (
    <>
      <svg className="rose-filigree" viewBox="0 0 480 380" focusable="false">
        <path className="filigree-line" d="M466 32 C342 14 360 145 252 131 C143 117 162 241 64 238" />
        <path className="filigree-line thin" d="M464 75 C378 64 383 174 283 161 C184 147 191 284 86 278" />
        <circle className="filigree-dot" cx="254" cy="131" r="7" />
        <circle className="filigree-dot" cx="64" cy="238" r="5" />
      </svg>
      <svg className="rose-ribbon" viewBox="0 0 1200 220" preserveAspectRatio="none" focusable="false">
        <path className="ribbon-a" d="M0 159 C173 22 270 211 411 115 S724 48 859 137 S1072 163 1200 68" />
        <path className="ribbon-b" d="M0 191 C164 74 310 227 443 151 S702 94 860 172 S1084 195 1200 130" />
      </svg>
      <div className="rose-petals">
        {petals.map((item) => <i key={item} className={`rose-petal rose-petal-${item}`} />)}
      </div>
      <div className="rose-dew">
        <i className="dewdrop dewdrop-a" /><i className="dewdrop dewdrop-b" /><i className="dewdrop dewdrop-c" />
      </div>
      <svg className="rose-bloom" viewBox="0 0 240 260" focusable="false">
        <path className="bloom-stem" d="M112 256 C105 210 112 176 117 145" />
        <path className="bloom-leaf" d="M109 217 C75 211 56 189 54 168 C86 169 109 184 109 217Z" />
        <path className="bloom-leaf mirror" d="M114 198 C143 179 165 181 179 193 C160 213 135 215 114 198Z" />
        <path className="bloom-petal" d="M116 142 C79 113 82 74 112 61 C127 79 134 111 116 142Z" />
        <path className="bloom-petal alt" d="M116 142 C116 95 149 73 173 90 C167 119 143 139 116 142Z" />
        <path className="bloom-petal soft" d="M116 142 C80 145 59 122 66 97 C91 94 114 113 116 142Z" />
      </svg>
    </>
  );
}

export default function ThemeEnvironment({ theme, appearance }) {
  return (
    <div className={`theme-environment env-${theme} env-${appearance}`} aria-hidden="true">
      <div className="env-haze env-haze-a" />
      <div className="env-haze env-haze-b" />
      <div className="env-haze env-haze-c" />
      {theme !== "original" && <div className="env-haze env-haze-d" />}
      {theme === "ocean" && <OceanEnvironment />}
      {theme === "forest" && <ForestEnvironment />}
      {theme === "coffee" && <CoffeeEnvironment />}
      {theme === "rose" && <RoseEnvironment />}
    </div>
  );
}
