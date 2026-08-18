import { useEffect, useState } from 'react';

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

export function App() {
  const aboutProgress = useAboutProgress();

  return (
    <main className="site-shell" id="top">
      <div
        className="about-story"
        style={{ '--about-progress': aboutProgress }}
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
          <div className="story-wash" aria-hidden="true" />

          <div className="hero-content">
            <h1>Edgar Agunias</h1>

            <nav aria-label="Primary navigation">
              {navItems.map((item) => (
                <a className={item.className} href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div
            className="about-lockup"
            aria-hidden={aboutProgress < 0.55}
          >
            <h2>About Me, Edgar Agunias</h2>
          </div>
        </div>

        <span className="about-anchor" id="about" aria-hidden="true" />
      </div>
    </main>
  );
}
