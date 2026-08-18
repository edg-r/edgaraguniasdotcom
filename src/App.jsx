import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const navItems = [
  { href: '#about', label: 'About Me', className: 'nav-about' },
  { href: '#job-lens', label: 'Job Lens', className: 'nav-secondary' },
  { href: '#photography', label: 'Photography', className: 'nav-secondary' },
];

const aboutCopy = [
  'As thankful son of a career US Navy Veteran and Migration Policy Analyst, I have lived more of my life outside of the US, than inside. Which I know, has given me a unique perspective on my place and more importantly the United States’ place in geopolitics. Growing up in Italy, Thailand, the Philippines, and the Netherlands I have attended international schools with just about every possible, nationality, ethnicity, religious background, and socioeconomic status.',
  'Using this lived experience, I focused on quantitative sociology, at the University of Amsterdam. Putting academic names to cultural experiences I had grown up learning intuitively. I developed my quantitative and mixed method skills in data analysis with programs such as STATA and SPSS. As well as my interpersonal skills by joining the Interdisciplinary Honours and Talent Programme.',
  'I am passionate about international relations and thrive in multicultural environments. I pride myself on my pragmatism, communication and leadership skills, which allow me to adapt to any working environment.',
];

function useAboutProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const distance = Math.max(window.innerHeight, 1);
      const nextProgress = Math.min(1, Math.max(0, window.scrollY / distance));
      setProgress(nextProgress);
    };

    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return progress;
}

function useAboutLinkMotion() {
  const [motion, setMotion] = useState({
    dx: 0,
    dy: 0,
    scaleEnd: 1,
    nameScaleEnd: 1,
    nameFontSize: 0,
    aboutFontSize: 0,
    aboutLinkWidth: 0,
    aboutLinkHeight: 0,
    aboutLabelWidth: 0,
    headingHeight: 0,
  });

  useLayoutEffect(() => {
    const measure = () => {
      const story = document.querySelector('.about-story');
      const aboutLink = document.querySelector('.nav-about');
      const aboutLabel = document.querySelector('.nav-label');
      const comma = document.querySelector('.nav-comma');
      const heading = document.querySelector('h1');
      const name = document.querySelector('.name-link');
      const target = document.querySelector('.about-target');

      if (!story || !aboutLink || !aboutLabel || !comma || !heading || !name || !target) {
        return;
      }

      // Measure the two elements in their starting geometry. This temporarily
      // removes the scroll-driven transforms so a refresh at #about cannot
      // overwrite the motion values with already-transformed coordinates.
      const previousHeadingTransform = heading.style.transform;
      const previousAboutTransform = aboutLink.style.transform;
      const previousHeadingFontSize = heading.style.fontSize;
      const previousAboutFontSize = aboutLink.style.fontSize;

      heading.style.transform = 'none';
      aboutLink.style.transform = 'none';

      try {
        const aboutRect = aboutLink.getBoundingClientRect();
        const aboutLabelRange = document.createRange();
        const nameRange = document.createRange();
        aboutLabelRange.selectNodeContents(aboutLabel);
        nameRange.selectNodeContents(name);

        const aboutLabelRect = aboutLabelRange.getBoundingClientRect();
        const commaRect = comma.getBoundingClientRect();
        const nameRect = nameRange.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const headingFontSize = Number.parseFloat(getComputedStyle(heading).fontSize);
        const aboutFontSize = Number.parseFloat(getComputedStyle(aboutLink).fontSize);
        const nameScaleEnd = Number.parseFloat(
          getComputedStyle(story).getPropertyValue('--name-scale-end'),
        );
        const linkScaleEnd = (headingFontSize * nameScaleEnd) / aboutFontSize;
        const finalNameWidth = nameRect.width * nameScaleEnd;
        const finalAboutWidth = (aboutLabelRect.width + commaRect.width) * linkScaleEnd;
        const finalGap = headingFontSize * nameScaleEnd * 0.25;
        const targetLeft = nameRect.right - finalNameWidth - finalGap - finalAboutWidth;

        // Use the actual end-state font sizes when finding the text baselines.
        // Scaling the starting range offsets is close, but font metrics shift the
        // rendered text by a fractional pixel at the final scroll position.
        heading.style.fontSize = `${headingFontSize * nameScaleEnd}px`;
        aboutLink.style.fontSize = `${aboutFontSize * linkScaleEnd}px`;

        const finalNameRange = document.createRange();
        const finalAboutLabelRange = document.createRange();
        finalNameRange.selectNodeContents(name);
        finalAboutLabelRange.selectNodeContents(aboutLabel);

        const finalHeadingRect = heading.getBoundingClientRect();
        const finalAboutRect = aboutLink.getBoundingClientRect();
        const finalNameTopOffset = finalNameRange.getBoundingClientRect().top - finalHeadingRect.top;
        const finalAboutTopOffset =
          finalAboutLabelRange.getBoundingClientRect().top - finalAboutRect.top;
        const targetTop = targetRect.top + finalNameTopOffset - finalAboutTopOffset;

        setMotion({
          dx: targetLeft - aboutRect.left,
          dy: targetTop - aboutRect.top,
          scaleEnd: linkScaleEnd,
          nameScaleEnd,
          nameFontSize: headingFontSize,
          aboutFontSize,
          aboutLinkWidth: aboutRect.width,
          aboutLinkHeight: aboutRect.height,
          aboutLabelWidth: aboutLabelRect.width,
          headingHeight: headingRect.height,
        });
      } finally {
        heading.style.transform = previousHeadingTransform;
        aboutLink.style.transform = previousAboutTransform;
        heading.style.fontSize = previousHeadingFontSize;
        aboutLink.style.fontSize = previousAboutFontSize;
      }
    };

    measure();
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener('resize', measure);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return motion;
}

function useAboutPhotoReveal(aboutProgress) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (aboutProgress < 0.98) {
      setIsVisible(false);
      return undefined;
    }

    const timeout = window.setTimeout(() => setIsVisible(true), 1000);
    return () => window.clearTimeout(timeout);
  }, [aboutProgress]);

  return isVisible;
}

function usePhotoDeckTilt() {
  const deckRef = useRef(null);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return undefined;

    let frame = 0;
    let tiltX = 0;
    let tiltY = 0;

    const applyTilt = () => {
      frame = 0;
      deck.style.setProperty('--pointer-tilt-x', `${tiltX}deg`);
      deck.style.setProperty('--pointer-tilt-y', `${tiltY}deg`);
    };

    const scheduleTilt = () => {
      if (!frame) frame = window.requestAnimationFrame(applyTilt);
    };

    const handlePointerMove = (event) => {
      const rect = deck.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
      const y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
      tiltX = Math.max(-11, Math.min(11, x * 11));
      tiltY = Math.max(-9, Math.min(9, y * -9));
      scheduleTilt();
    };

    const resetTilt = () => {
      tiltX = 0;
      tiltY = 0;
      scheduleTilt();
    };

    // Track the viewport rather than the deck itself so the hidden deck can
    // inherit the current pointer-facing tilt before it fades in.
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', resetTilt);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', resetTilt);
    };
  }, []);

  return deckRef;
}

export function App() {
  const aboutProgress = useAboutProgress();
  const aboutLinkMotion = useAboutLinkMotion();
  const photoReveal = useAboutPhotoReveal(aboutProgress);
  const photoDeckRef = usePhotoDeckTilt();
  const aboutCopyProgress = Math.min(1, Math.max(0, (aboutProgress - 0.38) / 0.62));
  const nameFontSize = aboutLinkMotion.nameFontSize
    ? aboutLinkMotion.nameFontSize *
      (1 - aboutProgress * (1 - aboutLinkMotion.nameScaleEnd))
    : undefined;
  const aboutFontSize = aboutLinkMotion.aboutFontSize
    ? aboutLinkMotion.aboutFontSize *
      (1 + aboutProgress * (aboutLinkMotion.scaleEnd - 1))
    : undefined;
  const aboutLabelWidth = aboutLinkMotion.aboutLabelWidth
    ? aboutLinkMotion.aboutLabelWidth *
      (1 + aboutProgress * (aboutLinkMotion.scaleEnd - 1))
    : undefined;

  return (
    <main className="site-shell" id="top">
      <div
        className="about-story"
        style={{
          '--about-progress': aboutProgress,
          '--about-link-dx': `${aboutLinkMotion.dx}px`,
          '--about-link-dy': `${aboutLinkMotion.dy}px`,
          '--name-font-size': nameFontSize ? `${nameFontSize}px` : undefined,
          '--name-layout-height': aboutLinkMotion.headingHeight
            ? `${aboutLinkMotion.headingHeight}px`
            : undefined,
          '--about-link-font-size': aboutFontSize ? `${aboutFontSize}px` : undefined,
          '--about-link-width': aboutLinkMotion.aboutLinkWidth
            ? `${aboutLinkMotion.aboutLinkWidth}px`
            : undefined,
          '--about-link-height': aboutLinkMotion.aboutLinkHeight
            ? `${aboutLinkMotion.aboutLinkHeight}px`
            : undefined,
          '--about-link-label-width': aboutLabelWidth ? `${aboutLabelWidth}px` : undefined,
          '--about-copy-progress': aboutCopyProgress,
        }}
      >
        <div className="story-stage">
          <img
            className="story-image story-image-hero"
            src="/images/img-3327.jpg"
            alt="A film photograph of globes behind a wood-and-glass display case"
          />
          <img
            className="story-image story-image-about"
            src="/images/about-portrait.jpg"
            alt="Edgar Agunias at a graduation ceremony"
          />

          <div className="about-copy" aria-label="About Me">
            {aboutCopy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div
            className={`about-photo-deck${photoReveal ? ' is-visible' : ''}`}
            ref={photoDeckRef}
            aria-hidden={!photoReveal}
          >
            <figure className="about-photo-card about-photo-card-family">
              <img
                src="/images/about-family.jpg"
                alt="A group of children in a classroom"
                decoding="async"
              />
            </figure>
            <figure className="about-photo-card about-photo-card-father">
              <img
                src="/images/about-father-and-children.jpg"
                alt="A father with two children at an outdoor gathering"
                decoding="async"
              />
            </figure>
          </div>

          <div className="hero-content">
            <h1>
              <a className="name-link" href="#top">
                Edgar Agunias
              </a>
            </h1>

            <nav aria-label="Primary navigation">
              {navItems.map((item) => (
                <a className={item.className} href={item.href} key={item.href}>
                  {item.href === '#about' ? (
                    <>
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-comma">,</span>
                    </>
                  ) : (
                    item.label
                  )}
                </a>
              ))}
            </nav>
          </div>

          <div className="about-target" aria-hidden="true" />
        </div>

        <span className="about-anchor" id="about" aria-hidden="true" />
      </div>
    </main>
  );
}
