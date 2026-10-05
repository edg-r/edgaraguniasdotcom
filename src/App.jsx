import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const navItems = [
  { href: '#about', label: 'About Me', className: 'nav-about' },
  { href: '#career', label: 'Career', className: 'nav-secondary' },
  { href: '#photography', label: 'Photography', className: 'nav-secondary' },
];

const aboutCopy = [
  'As thankful son of a career US Navy Veteran and Migration Policy Analyst, I have lived more of my life outside of the US, than inside. Which I know, has given me a unique perspective on my place and more importantly the United States’ place in geopolitics. Growing up in Italy, Thailand, the Philippines, and the Netherlands I have attended international schools with just about every possible, nationality, ethnicity, religious background, and socioeconomic status.',
  'Using this lived experience, I focused on quantitative sociology, at the University of Amsterdam. Putting academic names to cultural experiences I had grown up learning intuitively. I developed my quantitative and mixed method skills in data analysis with programs such as STATA and SPSS. As well as my interpersonal skills by joining the Interdisciplinary Honours and Talent Programme.',
  'I am passionate about international relations and thrive in multicultural environments. I pride myself on my pragmatism, communication and leadership skills, which allow me to adapt to any working environment.',
];

const aboutPhotos = [
  {
    className: 'about-photo-card-family',
    src: '/images/about-family.jpg',
    alt: 'A child and woman pictured at Bolling Air Force Base',
    title: 'Bolling Airforce Base image',
    location: '2002 Bolling Airforce Base, DC',
    description:
      'When my dad was still active duty and my mother was attending Georgetown.',
  },
  {
    className: 'about-photo-card-father',
    src: '/images/about-father-and-children.jpg',
    alt: 'A father with two children at an outdoor gathering',
    title: 'Photo with my brother and father',
    location: '2004 Sicily, Italy - Naval Air Station Sigonella',
    description: 'Pictured my father and my little brother Stefano',
  },
];

// Hung in this order down three rows, column by column. A portrait takes two
// rows, so each column is three landscapes or one portrait and one landscape.
// The last print hangs alone in the middle row to close the wall.
const galleryWall = [
  {
    id: 'img-0527',
    size: 'landscape',
    alt: 'A lone rider on horseback crossing a field of yellow wildflowers in front of dark trees',
  },
  {
    id: 'img-0245',
    size: 'portrait',
    alt: 'A blurred black-and-white photograph of a couple kissing in a crowd at night',
  },
  {
    id: 'img-3320',
    size: 'landscape',
    alt: 'The sun setting behind silhouetted buildings under a web of tram wires',
  },
  {
    id: 'img-9576',
    size: 'landscape',
    alt: 'White confetti falling over a crowd, seen from above',
  },
  {
    id: 'img-4896',
    size: 'landscape',
    alt: 'Sunlight and shadow across a corrugated awning beneath a row of windows',
  },
  {
    id: 'img-5182',
    size: 'portrait',
    alt: 'A windmill beside a canal under a clear pale sky',
  },
  {
    id: 'img-0663',
    size: 'landscape',
    alt: 'A black-and-white photograph of a mounted police officer on a white horse above a crowd',
  },
  {
    id: 'img-4465',
    size: 'landscape',
    alt: 'A black-and-white photograph of police officers seen from behind in a station hall hung with globe lights',
  },
  {
    id: 'img-6555',
    size: 'landscape',
    alt: 'A person holding pink cotton candy in front of their face',
  },
  {
    id: 'img-5760',
    size: 'landscape',
    alt: 'A black-and-white photograph of a crenellated stone castle wall',
  },
  {
    id: 'img-6028',
    size: 'landscape',
    alt: 'A traveler walking past a yellow airport sign for the baggage hall and arrivals, with a light leak on the left of the frame',
  },
  {
    id: 'img-6036',
    size: 'portrait',
    alt: 'A person walking through an airport hall carrying a jacket and a bag',
  },
  {
    id: 'img-6038',
    size: 'landscape',
    alt: 'A man on a moving walkway holding a folded newspaper behind his back',
  },
  {
    id: 'img-4901',
    size: 'landscape',
    alt: 'A red-and-white traffic mirror on a brick wall reflecting a sunlit street',
  },
  {
    id: 'img-8009',
    size: 'landscape',
    alt: 'A black-and-white photograph of an ornate carved stone pavilion roof seen from below',
  },
  {
    id: 'img-5790',
    size: 'landscape',
    alt: 'A suspension bridge across a river at dusk, with two people sitting on the dark shore',
    row: 2,
  },
];

function getGalleryPhoto(frame) {
  const isPortrait = frame.size === 'portrait';
  return {
    ...frame,
    src: `/images/gallery/${frame.id}.webp`,
    thumb: `/images/gallery/${frame.id}-thumb.webp`,
    width: isPortrait ? 2 : 3,
    height: isPortrait ? 3 : 2,
    isGallery: true,
  };
}

function getCardOrientation(element) {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === 'none') {
    return 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
  }

  const values = transform
    .replace(/^matrix3d\(|^matrix\(|\)$/g, '')
    .split(',')
    .map(Number);

  if (values.length === 16 && values.every(Number.isFinite)) {
    values[12] = 0;
    values[13] = 0;
    values[14] = 0;
    return `matrix3d(${values.join(', ')})`;
  }

  if (values.length === 6 && values.every(Number.isFinite)) {
    const [a, b, c, d] = values;
    return `matrix3d(${a}, ${b}, 0, 0, ${c}, ${d}, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`;
  }

  return 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
}

function getPhotoFlightTransform(sourceRect, targetRect, origin, depth) {
  const sourceCenterX = sourceRect.left + sourceRect.width / 2;
  const sourceCenterY = sourceRect.top + sourceRect.height / 2;
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const scaleX = origin.layoutWidth / targetRect.width;
  const scaleY = origin.layoutHeight / targetRect.height;

  return `translate3d(${sourceCenterX - targetCenterX}px, ${
    sourceCenterY - targetCenterY
  }px, ${depth}px) ${origin.orientation} scale3d(${scaleX}, ${scaleY}, 1)`;
}

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
      // removes the scroll-driven transforms and measured output variables so
      // a refresh at #about or a return from Career cannot turn the current
      // end state into the next starting state.
      const previousHeadingTransform = heading.style.transform;
      const previousAboutTransform = aboutLink.style.transform;
      const previousHeadingFontSize = heading.style.fontSize;
      const previousAboutFontSize = aboutLink.style.fontSize;
      const measuredStyleProperties = [
        '--name-font-size',
        '--name-layout-height',
        '--about-link-font-size',
        '--about-link-width',
        '--about-link-height',
        '--about-link-label-width',
      ];
      const previousMeasuredStyles = measuredStyleProperties.map((property) => [
        property,
        story.style.getPropertyValue(property),
      ]);

      heading.style.transform = 'none';
      aboutLink.style.transform = 'none';
      measuredStyleProperties.forEach((property) => story.style.removeProperty(property));

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
        previousMeasuredStyles.forEach(([property, value]) => {
          if (value) {
            story.style.setProperty(property, value);
          } else {
            story.style.removeProperty(property);
          }
        });
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

    const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches ?? true;
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!hasFinePointer || prefersReducedMotion) return undefined;

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

function useResumeTilt() {
  const resumeRef = useRef(null);

  useEffect(() => {
    const resume = resumeRef.current;
    if (!resume) return undefined;

    const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches ?? true;
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!hasFinePointer || prefersReducedMotion) return undefined;

    let frame = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;

    const applyTilt = () => {
      frame = 0;
      currentRotateX += (targetRotateX - currentRotateX) * 0.14;
      currentRotateY += (targetRotateY - currentRotateY) * 0.14;
      resume.style.setProperty('--resume-rotate-x', `${currentRotateX}deg`);
      resume.style.setProperty('--resume-rotate-y', `${currentRotateY}deg`);

      if (
        Math.abs(targetRotateX - currentRotateX) > 0.01 ||
        Math.abs(targetRotateY - currentRotateY) > 0.01
      ) {
        frame = window.requestAnimationFrame(applyTilt);
      }
    };

    const scheduleTilt = () => {
      if (!frame) frame = window.requestAnimationFrame(applyTilt);
    };

    const handlePointerMove = (event) => {
      const rect = resume.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
      const y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
      targetRotateX = Math.max(-7, Math.min(7, y * -7));
      targetRotateY = Math.max(-9, Math.min(9, x * 9));
      scheduleTilt();
    };

    const resetTilt = () => {
      targetRotateX = 0;
      targetRotateY = 0;
      scheduleTilt();
    };

    // Keep the card responsive to the pointer across the whole viewport while
    // the Career section is visible, rather than only while the pointer is
    // directly over the card.
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', resetTilt);
    window.addEventListener('blur', resetTilt);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', resetTilt);
      window.removeEventListener('blur', resetTilt);
    };
  }, []);

  return resumeRef;
}

function useGalleryWall() {
  const wallRef = useRef(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return undefined;

    const updateEdges = () => {
      const maxScroll = wall.scrollWidth - wall.clientWidth;
      const atStart = wall.scrollLeft <= 2;
      const atEnd = wall.scrollLeft >= maxScroll - 2;
      setEdges((current) =>
        current.atStart === atStart && current.atEnd === atEnd ? current : { atStart, atEnd },
      );
    };

    // Mouse users drag the wall sideways; touch and trackpads use the native
    // horizontal scroll. A drag must not also open the frame under the pointer.
    let drag = null;
    let suppressClick = false;

    const handlePointerDown = (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { x: event.clientX, scrollLeft: wall.scrollLeft, moved: false };
    };

    const handlePointerMove = (event) => {
      if (!drag) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 6) return;
      drag.moved = true;
      wall.classList.add('is-dragging');
      wall.scrollLeft = drag.scrollLeft - dx;
    };

    const handlePointerUp = () => {
      if (!drag) return;
      suppressClick = drag.moved;
      drag = null;
      wall.classList.remove('is-dragging');
      if (suppressClick) window.setTimeout(() => { suppressClick = false; }, 0);
    };

    const handleClickCapture = (event) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches ?? true;
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const canTilt = hasFinePointer && !prefersReducedMotion;
    let frame = 0;
    let tiltX = 0;
    let tiltY = 0;

    const applyTilt = () => {
      frame = 0;
      wall.style.setProperty('--wall-tilt-x', `${tiltX}deg`);
      wall.style.setProperty('--wall-tilt-y', `${tiltY}deg`);
    };

    const handleTiltMove = (event) => {
      handlePointerMove(event);
      if (!canTilt) return;
      const x = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      const y = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
      tiltX = y * -2.4;
      tiltY = x * 4;
      if (!frame) frame = window.requestAnimationFrame(applyTilt);
    };

    updateEdges();
    wall.addEventListener('scroll', updateEdges, { passive: true });
    wall.addEventListener('pointerdown', handlePointerDown);
    wall.addEventListener('click', handleClickCapture, true);
    window.addEventListener('pointermove', handleTiltMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('resize', updateEdges);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      wall.removeEventListener('scroll', updateEdges);
      wall.removeEventListener('pointerdown', handlePointerDown);
      wall.removeEventListener('click', handleClickCapture, true);
      window.removeEventListener('pointermove', handleTiltMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('resize', updateEdges);
    };
  }, []);

  const step = useCallback((direction) => {
    const wall = wallRef.current;
    if (!wall) return;
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    wall.scrollBy({ left: direction * wall.clientWidth * 0.7, behavior });
  }, []);

  return { wallRef, edges, step };
}

export function App() {
  const aboutProgress = useAboutProgress();
  const aboutLinkMotion = useAboutLinkMotion();
  const photoReveal = useAboutPhotoReveal(aboutProgress);
  const photoDeckRef = usePhotoDeckTilt();
  const resumeCardRef = useResumeTilt();
  const { wallRef, edges: wallEdges, step: stepWall } = useGalleryWall();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const [photoOrigin, setPhotoOrigin] = useState(null);
  const lightboxPanelRef = useRef(null);
  const lightboxVisualRef = useRef(null);
  const lightboxAnimationRef = useRef(null);
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

  const closePhoto = useCallback(() => {
    if (!selectedPhoto || isLightboxClosing) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setSelectedPhoto(null);
      setPhotoOrigin(null);
      return;
    }

    setIsLightboxClosing(true);
  }, [isLightboxClosing, selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightboxPanelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closePhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePhoto, selectedPhoto]);

  useLayoutEffect(() => {
    const visual = lightboxVisualRef.current;
    if (!selectedPhoto || !photoOrigin || !visual) return undefined;

    const targetRect = visual.getBoundingClientRect();
    const sourceTransform = getPhotoFlightTransform(
      photoOrigin,
      targetRect,
      photoOrigin,
      0,
    );
    const finalTransform =
      'translate3d(0, 0, 0) rotateZ(0deg) rotateX(1deg) rotateY(-1deg) scale(1)';
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const animation = visual.animate(
      isLightboxClosing
        ? [
            { opacity: 1, transform: finalTransform },
            { opacity: 1, transform: sourceTransform },
          ]
        : [
            { opacity: 1, transform: sourceTransform },
            { opacity: 1, transform: finalTransform },
          ],
      {
        duration: prefersReducedMotion ? 1 : isLightboxClosing ? 420 : 720,
        easing: isLightboxClosing
          ? 'cubic-bezier(0.45, 0, 0.55, 1)'
          : 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      },
    );

    lightboxAnimationRef.current = animation;

    if (isLightboxClosing) {
      animation.onfinish = () => {
        if (lightboxAnimationRef.current !== animation) return;
        setSelectedPhoto(null);
        setPhotoOrigin(null);
        setIsLightboxClosing(false);
        lightboxAnimationRef.current = null;
      };
    }

    return () => {
      animation.cancel();
      if (lightboxAnimationRef.current === animation) {
        lightboxAnimationRef.current = null;
      }
    };
  }, [isLightboxClosing, photoOrigin, selectedPhoto]);

  const openPhoto = (photo, event) => {
    const card = event.currentTarget.closest('.about-photo-card, .gallery-frame');
    const sourceRect = card?.getBoundingClientRect();

    setPhotoOrigin(
      sourceRect
        ? {
            left: sourceRect.left,
            top: sourceRect.top,
            width: sourceRect.width,
            height: sourceRect.height,
            layoutWidth: card.offsetWidth,
            layoutHeight: card.offsetHeight,
            orientation: getCardOrientation(card),
          }
        : null,
    );
    setIsLightboxClosing(false);
    setSelectedPhoto(photo);
  };

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

          <div
            className={`about-copy${aboutCopyProgress > 0.5 ? ' is-interactive' : ''}`}
            aria-label="About Me"
            role="region"
            tabIndex={aboutCopyProgress > 0.5 ? 0 : -1}
          >
            {aboutCopy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div
            className={`about-photo-deck${photoReveal ? ' is-visible' : ''}`}
            ref={photoDeckRef}
            aria-hidden={!photoReveal}
          >
            {aboutPhotos.map((photo) => (
              <figure
                className={`about-photo-card ${photo.className}${
                  selectedPhoto?.src === photo.src ? ' is-modal-source' : ''
                }`}
                key={photo.src}
              >
                <button
                  className="about-photo-trigger"
                  type="button"
                  onClick={(event) => openPhoto(photo, event)}
                  aria-label={`Enlarge ${photo.title}`}
                >
                  <img src={photo.src} alt={photo.alt} decoding="async" />
                </button>
              </figure>
            ))}
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

        {selectedPhoto ? (
          <div
            className={`photo-lightbox${selectedPhoto.isGallery ? ' is-gallery' : ''}${
              isLightboxClosing ? ' is-closing' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={selectedPhoto.title || selectedPhoto.alt}
            onClick={closePhoto}
          >
            <div className="photo-lightbox-backdrop" aria-hidden="true" />
            <div className="photo-lightbox-panel" ref={lightboxPanelRef} tabIndex={-1}>
              <div className="photo-lightbox-visual" ref={lightboxVisualRef}>
                <img
                  className="photo-lightbox-image"
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                />
              </div>
              {selectedPhoto.location || selectedPhoto.description ? (
                <div className="photo-lightbox-caption">
                  <span>{selectedPhoto.location}</span>
                  <span>{selectedPhoto.description}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <span className="about-anchor" id="about" aria-hidden="true" />
      </div>

      <section className="career-panel" id="career">
        <div className="career-inner">
          <div className="career-layout">
            <div className="career-resume-column">
              <h2>Career</h2>
              <a
                className="career-resume-card"
                ref={resumeCardRef}
                href="/documents/edgar-agunias-resume-2027.pdf"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Edgar Agunias resume PDF"
              >
                <img
                  src="/images/edgar-resume-2027.svg"
                  alt="Edgar Agunias resume"
                  decoding="async"
                />
              </a>
              <div className="career-resume-links">
                <a
                  className="pill-link"
                  href="/documents/edgar-agunias-resume-2027.pdf"
                  download
                >
                  Click to download
                </a>
                <a
                  className="pill-link"
                  href="https://www.linkedin.com/in/edgar-agunias"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="photography-panel" id="photography">
        <div className="photography-intro">
          <h2>Photography</h2>
          <div className="photography-controls">
            <button
              className="wall-step"
              type="button"
              onClick={() => stepWall(-1)}
              disabled={wallEdges.atStart}
              aria-label="Move left along the wall"
            >
              ←
            </button>
            <button
              className="wall-step"
              type="button"
              onClick={() => stepWall(1)}
              disabled={wallEdges.atEnd}
              aria-label="Move right along the wall"
            >
              →
            </button>
            <a
              className="pill-link"
              href="https://www.instagram.com/edgaragunias/"
              target="_blank"
              rel="noreferrer"
              aria-label="Open @edgaragunias on Instagram"
            >
              @edgaragunias ↗
            </a>
          </div>
        </div>

        <div className="gallery-wall-stage">
          <div className="gallery-wall" ref={wallRef} tabIndex={0} aria-label="Gallery wall">
            <ul className="gallery-wall-track">
              {galleryWall.map(getGalleryPhoto).map((photo) => (
                <li
                  className={`gallery-hook is-${photo.size}`}
                  key={photo.id}
                  style={photo.row ? { gridRow: photo.row } : undefined}
                >
                  <button
                    className={`gallery-frame${
                      selectedPhoto?.src === photo.src ? ' is-modal-source' : ''
                    }`}
                    type="button"
                    onClick={(event) => openPhoto(photo, event)}
                    aria-label={`View full screen: ${photo.alt}`}
                  >
                    <img
                      src={photo.thumb}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                      draggable={false}
                      decoding="async"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
