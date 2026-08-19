import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createAssessment, sendSessionMessage, submitSurvey } from './jobLens.js';

const navItems = [
  { href: '#about', label: 'About Me', className: 'nav-about' },
  { href: '#job-lens', label: 'Career', className: 'nav-secondary' },
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

const careerTimelineYears = ['2022', '2023', '2024', '2025', '2026', '2027'];

const fitLabels = {
  strong_fit: 'Strong fit',
  partial_fit: 'Partial fit',
  not_a_fit: 'Not a fit',
  uncertain: 'Needs more evidence',
};

const fitDescriptions = {
  strong_fit: 'The available evidence supports the core requirements of this role.',
  partial_fit: 'The evidence connects to important parts of the role, with gaps for the recruiter to review.',
  not_a_fit: 'The available evidence does not establish a strong match for the role as described.',
  uncertain: 'The current evidence is not enough to make a confident match judgment yet.',
};

function displayFitLevel(level) {
  return fitLabels[level] || fitLabels.uncertain;
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

function useResumeTilt() {
  const resumeRef = useRef(null);

  useEffect(() => {
    const resume = resumeRef.current;
    if (!resume) return undefined;

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

export function App() {
  const aboutProgress = useAboutProgress();
  const aboutLinkMotion = useAboutLinkMotion();
  const photoReveal = useAboutPhotoReveal(aboutProgress);
  const photoDeckRef = usePhotoDeckTilt();
  const resumeCardRef = useResumeTilt();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const [photoOrigin, setPhotoOrigin] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState(null);
  const [jobComposerMessage, setJobComposerMessage] = useState('');
  const [isJobDropActive, setIsJobDropActive] = useState(false);
  const [jobSession, setJobSession] = useState(null);
  const [jobMessages, setJobMessages] = useState([]);
  const [jobPendingQuestions, setJobPendingQuestions] = useState([]);
  const [jobMessage, setJobMessage] = useState('');
  const [jobMessageKind, setJobMessageKind] = useState('chat');
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');
  const [jobSurveyRating, setJobSurveyRating] = useState(null);
  const [selectedCareerYear, setSelectedCareerYear] = useState(careerTimelineYears[0]);
  const [isCareerComposerOpen, setIsCareerComposerOpen] = useState(false);
  const jobPanelRef = useRef(null);
  const lightboxPanelRef = useRef(null);
  const lightboxVisualRef = useRef(null);
  const lightboxAnimationRef = useRef(null);
  const jobFileInputRef = useRef(null);
  const careerJobFileInputRef = useRef(null);
  useEffect(() => {
    const cycle = window.setInterval(() => {
      setSelectedCareerYear((currentYear) => {
        const currentIndex = careerTimelineYears.indexOf(currentYear);
        const nextIndex = currentIndex >= 0
          ? (currentIndex + 1) % careerTimelineYears.length
          : 0;
        return careerTimelineYears[nextIndex];
      });
    }, 2000);

    return () => window.clearInterval(cycle);
  }, []);

  const scrollToCareer = useCallback(() => {
    const careerPanel = jobPanelRef.current;
    if (!careerPanel) return;

    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    careerPanel.scrollIntoView({ behavior, block: 'start' });
  }, []);
  const aboutCopyProgress = Math.min(1, Math.max(0, (aboutProgress - 0.38) / 0.62));
  const jobComposerProgress = Math.min(1, Math.max(0, aboutProgress));
  const jobComposerScale = 1 - jobComposerProgress * 0.72;
  const jobComposerBlur = jobComposerProgress * 3;
  const jobComposerPillScale = 0.86 + jobComposerProgress * 0.14;
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
    const card = event.currentTarget.closest('.about-photo-card');
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

  const handleJobFile = useCallback(async (file) => {
    if (!file) return;

    setJobFile(file);
    setJobComposerMessage('');
    setIsCareerComposerOpen(true);
    scrollToCareer();

    const isTextFile =
      file.type.startsWith('text/') || /\.(txt|md|rtf)$/i.test(file.name);

    if (isTextFile) {
      try {
        setJobDescription(await file.text());
        setJobComposerMessage(`Loaded ${file.name}`);
      } catch {
        setJobComposerMessage('This text file could not be read.');
      }
      return;
    }

    setJobComposerMessage(`${file.name} attached`);
  }, [scrollToCareer]);

  const handleJobFileChange = (event) => {
    const [file] = event.target.files ?? [];
    void handleJobFile(file);
    event.target.value = '';
  };

  const handleJobDrop = (event) => {
    event.preventDefault();
    setIsJobDropActive(false);
    const [file] = event.dataTransfer.files ?? [];
    void handleJobFile(file);
  };

  const focusJobPanel = useCallback(() => {
    window.requestAnimationFrame(scrollToCareer);
  }, [scrollToCareer]);

  const handleJobSubmit = async (event) => {
    event.preventDefault();
    if (!jobDescription.trim() && !jobFile) {
      setJobComposerMessage('Paste a job description or upload a file first');
      return;
    }
    setJobLoading(true);
    setJobError('');
    setJobComposerMessage('Reading the role and comparing approved evidence…');
    try {
      const data = await createAssessment({ description: jobDescription, file: jobFile });
      setJobSession(data);
      setJobMessages(data.messages || []);
      setJobPendingQuestions(data.session?.assessment?.follow_up_questions || []);
      setJobMessageKind(data.session?.assessment?.follow_up_questions?.length ? 'clarification' : 'chat');
      setJobMessage('');
      setJobComposerMessage('Assessment ready below');
      focusJobPanel();
    } catch (error) {
      setJobError(error.message || 'The Job Lens service could not complete that request.');
      setJobComposerMessage('The assessment could not be completed');
    } finally {
      setJobLoading(false);
    }
  };

  const handleJobMessage = async (event, kind = jobMessageKind) => {
    event?.preventDefault?.();
    const message = jobMessage.trim();
    const sessionId = jobSession?.session?.session_id;
    if (!message || !sessionId || jobLoading) return;

    setJobLoading(true);
    setJobError('');
    setJobMessages((current) => [
      ...current,
      { role: 'user', kind, content: message, created_at: new Date().toISOString() },
    ]);
    setJobMessage('');
    try {
      const data = await sendSessionMessage(sessionId, message, kind);
      setJobSession((current) => (current ? { ...current, session: data.session } : current));
      setJobPendingQuestions(data.follow_up_questions || []);
      setJobMessageKind(data.follow_up_questions?.length ? 'clarification' : 'chat');
      setJobMessages((current) => [
        ...current,
        {
          role: 'assistant',
          kind: data.assessment ? 'assessment' : 'chat',
          content: data.reply,
          citations: data.citations || [],
          created_at: new Date().toISOString(),
        },
      ]);
      setJobMessageKind(kind === 'clarification' && data.follow_up_questions?.length ? 'clarification' : 'chat');
      if (data.budget_exhausted) setJobComposerMessage('This session has reached its inference budget');
    } catch (error) {
      setJobError(error.message || 'The Job Lens service could not answer that.');
    } finally {
      setJobLoading(false);
    }
  };

  const handleJobSurvey = async (rating) => {
    const sessionId = jobSession?.session?.session_id;
    if (!sessionId || jobSurveyRating) return;
    try {
      await submitSurvey(sessionId, rating);
      setJobSurveyRating(rating);
    } catch (error) {
      setJobError(error.message || 'The rating could not be saved.');
    }
  };

  const handleJobPillClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCareerComposer = () => {
    setIsCareerComposerOpen(true);
    scrollToCareer();
  };

  const renderJobComposer = (variant, fileInputRef) => {
    const isCareerComposer = variant === 'career';
    const isCareerTrigger = variant === 'career-trigger';

    return (
      <form
        className={isCareerComposer
          ? `job-composer career-job-composer${isCareerComposerOpen ? ' is-open' : ''}${
              isJobDropActive ? ' is-dragging' : ''
            }`
          : isCareerTrigger
            ? `job-composer career-job-match-pill${isCareerComposerOpen ? ' is-hidden' : ''}${
                isJobDropActive ? ' is-dragging' : ''
              }`
          : `job-composer${jobComposerProgress > 0.72 ? ' is-minimized' : ''}${
              isJobDropActive ? ' is-dragging' : ''
            }`}
        style={isCareerComposer || isCareerTrigger ? undefined : {
          '--job-composer-progress': jobComposerProgress,
          '--job-composer-scale': jobComposerScale,
          '--job-composer-blur': `${jobComposerBlur}px`,
          '--job-composer-pill-scale': jobComposerPillScale,
        }}
        onSubmit={handleJobSubmit}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsJobDropActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsJobDropActive(false);
        }}
        onDrop={handleJobDrop}
        aria-label={isCareerComposer ? 'Career match workspace' : 'Career match'}
        aria-hidden={isCareerComposer ? !isCareerComposerOpen : isCareerTrigger ? isCareerComposerOpen : undefined}
        inert={isCareerComposer ? !isCareerComposerOpen : isCareerTrigger ? isCareerComposerOpen : undefined}
      >
        <div
          className={`job-composer-surface${isCareerComposer ? ' is-expanded' : ''}`}
          aria-hidden={!isCareerComposer && jobComposerProgress > 0.82}
        >
          <div className="job-composer-header">
            <span className="job-composer-eyebrow">CAREER / MATCH</span>
            <button
              className="job-upload-button"
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                if (isCareerTrigger) {
                  openCareerComposer();
                } else if (!isCareerComposer) {
                  scrollToCareer();
                }
              }}
            >
              Upload file
            </button>
            <input
              ref={fileInputRef}
              className="job-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,application/rtf"
              onChange={handleJobFileChange}
              aria-label="Upload a PDF, Word, or text file"
            />
          </div>

          <label className="job-composer-field">
            <span className="sr-only">Job description</span>
            <textarea
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value);
                setJobComposerMessage('');
              }}
              onFocus={isCareerTrigger ? openCareerComposer : undefined}
              onPaste={() => {
                if (isCareerTrigger) setIsCareerComposerOpen(true);
                if (!isCareerComposer && !isCareerTrigger) setIsCareerComposerOpen(true);
                window.setTimeout(scrollToCareer, 0);
              }}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  void handleJobSubmit(event);
                }
              }}
              placeholder="Paste job description to see if we're a match!"
              rows={isCareerComposer ? 3 : 1}
            />
          </label>

          {isCareerComposer && jobComposerMessage ? (
            <span className="job-composer-status" role="status">
              {jobComposerMessage}
            </span>
          ) : null}
        </div>

        {!isCareerComposer && !isCareerTrigger ? (
          <button
            className="job-composer-pill"
            type="button"
            onClick={handleJobPillClick}
            aria-label="Return to Job Match"
            aria-hidden={jobComposerProgress < 0.72}
          >
            <span>Job Match</span>
          </button>
        ) : null}
      </form>
    );
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

          <div className="about-copy" aria-label="About Me">
            {aboutCopy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {renderJobComposer('hero', jobFileInputRef)}

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
            className={`photo-lightbox${isLightboxClosing ? ' is-closing' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={selectedPhoto.title}
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
              <div className="photo-lightbox-caption">
                <span>{selectedPhoto.location}</span>
                <span>{selectedPhoto.description}</span>
              </div>
            </div>
          </div>
        ) : null}

        <span className="about-anchor" id="about" aria-hidden="true" />
      </div>

      <section className={`job-lens-panel${jobSession ? ' has-session' : ''}`} id="job-lens" ref={jobPanelRef}>
        <div className="job-lens-inner">
          <div className={`career-layout${isCareerComposerOpen ? ' is-composer-open' : ''}`}>
            <aside className="career-timeline" aria-label="Career timeline">
              <h3 className="career-timeline-heading">Timeline</h3>
              <div className="career-timeline-list">
                {careerTimelineYears.map((year) => (
                  <button
                    className={`career-timeline-year${selectedCareerYear === year ? ' is-active' : ''}`}
                    type="button"
                    key={year}
                    aria-label={`Select ${year}`}
                    aria-pressed={selectedCareerYear === year}
                    onClick={() => setSelectedCareerYear(year)}
                  >
                    <span className="career-timeline-year-label">{year}</span>
                    <span className="career-timeline-marker" aria-hidden="true" />
                    <span className="career-timeline-slot" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </aside>

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
              <a
                className="career-resume-download"
                href="/documents/edgar-agunias-resume-2027.pdf"
                download
              >
                Click to download
              </a>
            </div>

            {renderJobComposer('career-trigger', careerJobFileInputRef)}
            {renderJobComposer('career', careerJobFileInputRef)}
          </div>

          {jobSession?.session?.assessment ? (
            <div className="job-lens-results">
              <div className="job-lens-result-head">
                <div>
                  <p className="result-kicker">ASSESSMENT {jobSession.session.assessment.ordinal}</p>
                  <h3>{displayFitLevel(jobSession.session.assessment.fit_level)}</h3>
                </div>
                <span className={`fit-badge fit-${jobSession.session.assessment.fit_level}`}>
                  {jobSession.session.assessment.final ? 'Final' : 'Reviewable'}
                </span>
              </div>

              <p className="job-lens-headline">{jobSession.session.assessment.headline}</p>
              <p className="job-lens-summary">
                {jobSession.session.assessment.summary || fitDescriptions[jobSession.session.assessment.fit_level]}
              </p>

              <div className="job-lens-columns">
                <div>
                  <p className="result-kicker">CONNECTED TO THE ROLE</p>
                  <div className="requirement-list">
                    {jobSession.session.assessment.requirements?.length ? (
                      jobSession.session.assessment.requirements.map((item, index) => (
                        <article className="requirement-card" key={`${item.requirement}-${index}`}>
                          <div className="requirement-card-head">
                            <strong>{item.requirement}</strong>
                            <span className={`requirement-status status-${item.status}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p>{item.explanation}</p>
                          {item.evidence?.length ? (
                            <div className="evidence-links">
                              {item.evidence.map((evidence) => (
                                <a href={evidence.project_url || evidence.artifact_url || '#'} target="_blank" rel="noreferrer" key={`${evidence.evidence_id}-${evidence.title}`}>
                                  {evidence.title} ↗
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      ))
                    ) : (
                      <p className="muted-result">No specific connections were returned yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="result-kicker">GAPS / UNCERTAINTY</p>
                  {jobSession.session.assessment.gaps?.length ? (
                    <ul className="gap-list">
                      {jobSession.session.assessment.gaps.map((gap) => <li key={gap}>{gap}</li>)}
                    </ul>
                  ) : (
                    <p className="muted-result">No unresolved gaps were returned.</p>
                  )}
                  <p className="result-note">{fitDescriptions[jobSession.session.assessment.fit_level]}</p>
                </div>
              </div>

              {jobPendingQuestions.length ? (
                <div className="follow-up-box">
                  <div>
                    <p className="result-kicker">OPTIONAL FOLLOW-UP</p>
                    <p>These questions only clarify a gap or connect the role to an approved project. You can answer them together or skip them.</p>
                  </div>
                  <ol>
                    {jobPendingQuestions.map((question) => <li key={question}>{question}</li>)}
                  </ol>
                  <button type="button" className="text-action" onClick={() => setJobMessageKind('clarification')}>
                    Answer follow-ups
                  </button>
                  <button type="button" className="text-action" onClick={() => setJobMessageKind('chat')}>
                    Ask about a project
                  </button>
                </div>
              ) : null}

              <div className="job-lens-chat">
                <div className="chat-heading">
                  <div>
                    <p className="result-kicker">ASK ABOUT THE WORK</p>
                    <p>Ask about a project or evidence item. Luna can explain approved work and link you to the source.</p>
                  </div>
                  <span className="budget-readout">${jobSession.session.budget_spent_usd.toFixed(2)} / $5 session budget</span>
                </div>
                <div className="chat-transcript" aria-live="polite">
                  {jobMessages.length ? jobMessages.map((message, index) => (
                    <div className={`chat-message chat-${message.role}`} key={`${message.created_at}-${index}`}>
                      <span>{message.role === 'user' ? 'Recruiter' : 'Job Lens'}</span>
                      <p>{message.content}</p>
                      {message.citations?.length ? (
                        <div className="evidence-links">
                          {message.citations.map((citation) => (
                            <a href={citation.project_url || citation.artifact_url || '#'} target="_blank" rel="noreferrer" key={`${citation.evidence_id}-${citation.title}`}>
                              {citation.title} ↗
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )) : (
                    <p className="muted-result">The evidence conversation will appear here.</p>
                  )}
                </div>
                <form className="chat-input-form" onSubmit={(event) => handleJobMessage(event, jobMessageKind)}>
                  <textarea
                    value={jobMessage}
                    onChange={(event) => setJobMessage(event.target.value)}
                    placeholder={jobPendingQuestions.length ? 'Answer the follow-ups or ask about an approved project…' : 'Ask about an approved project…'}
                    rows={3}
                    aria-label="Ask Job Lens about Edgar's work"
                  />
                  <div className="chat-input-footer">
                    <span>{jobMessageKind === 'clarification' ? 'Answering targeted follow-ups' : 'Evidence-grounded project Q&A'}</span>
                    <button type="submit" disabled={jobLoading || !jobMessage.trim()}>
                      {jobLoading ? 'Working…' : 'Send'}
                    </button>
                  </div>
                </form>
              </div>

              {jobError ? <p className="job-lens-error" role="alert">{jobError}</p> : null}

              {jobSession.session.assessment.final ? (
                <div className="contact-box">
                  <p className="result-kicker">NEXT STEP</p>
                  <p>The final assessment is complete. For more context, contact Edgar directly.</p>
                  <a
                    className="contact-link"
                    href={`mailto:edgar.agunias@gmail.com?subject=${encodeURIComponent(`Job Lens assessment – ${jobSession.session.session_id}`)}&body=${encodeURIComponent('Hello Edgar,\n\nI reviewed your Job Lens assessment for [role/company]. I would like to follow up about…\n')}`}
                  >
                    Draft an email to Edgar ↗
                  </a>
                </div>
              ) : null}

              <div className="job-lens-footer">
                <details>
                  <summary>Privacy and deletion</summary>
                  <p>{jobSession.privacy_notice}</p>
                  <p>Your deletion request ID: <code>{jobSession.session.deletion_request_id}</code></p>
                </details>
                <div className="survey-block">
                  <span>How was this experience?</span>
                  <div className="survey-stars" aria-label="Rate this experience from one to five stars">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        type="button"
                        key={rating}
                        className={jobSurveyRating && rating <= jobSurveyRating ? 'is-rated' : ''}
                        onClick={() => handleJobSurvey(rating)}
                        aria-label={`${rating} out of 5 stars`}
                        disabled={Boolean(jobSurveyRating)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
