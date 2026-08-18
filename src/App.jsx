import { useEffect, useLayoutEffect, useState } from 'react';

const navItems = [
  { href: '#about', label: 'About Me', className: 'nav-about' },
  { href: '#job-lens', label: 'Job Lens', className: 'nav-secondary' },
  { href: '#photography', label: 'Photography', className: 'nav-secondary' },
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
        const nameTopOffset = nameRect.top - headingRect.top;
        const aboutTopOffset = aboutLabelRect.top - aboutRect.top;
        const targetTop =
          targetRect.top + (nameTopOffset * nameScaleEnd) - (aboutTopOffset * linkScaleEnd);

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

export function App() {
  const aboutProgress = useAboutProgress();
  const aboutLinkMotion = useAboutLinkMotion();
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
