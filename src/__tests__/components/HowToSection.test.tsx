import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HowToSection } from '@/components/HowToSection';

describe('HowToSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<HowToSection />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should render the section with correct id', () => {
    const { container } = render(<HowToSection />);

    const section = container.querySelector('#how-it-works');
    expect(section).toBeInTheDocument();
  });

  it('should render subtitle text', () => {
    render(<HowToSection />);

    expect(screen.getByText(/Follow these 8 simple steps to securely analyze/)).toBeInTheDocument();
  });

  describe('how-to steps', () => {
    it('should render all 8 steps', () => {
      render(<HowToSection />);

      // Check step numbers are rendered
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(String(i))).toBeInTheDocument();
      }
    });

    it('should render step titles', () => {
      render(<HowToSection />);

      expect(screen.getByText('Open Data Export Page')).toBeInTheDocument();
      expect(screen.getByText("Select 'Some of your information'")).toBeInTheDocument();
      expect(screen.getByText("Check only 'Followers and following'")).toBeInTheDocument();
      expect(screen.getByText('Select JSON format')).toBeInTheDocument();
      expect(screen.getByText("Choose 'All time' and tap 'Create files'")).toBeInTheDocument();
      expect(screen.getByText('Wait for email notification')).toBeInTheDocument();
      expect(screen.getByText('Download the ZIP file')).toBeInTheDocument();
      expect(screen.getByText('Upload & Reveal Results')).toBeInTheDocument();
    });

    it('should render step descriptions', () => {
      render(<HowToSection />);

      expect(
        screen.getByText(/Tap the button below to go directly to the platform's data export page/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/This is critical: Choose JSON, not HTML format/)
      ).toBeInTheDocument();
    });

    it('should show Important badge for warning step', () => {
      render(<HowToSection />);

      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('should render step images with lazy loading', () => {
      render(<HowToSection />);

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);

      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Schema.org JSON-LD', () => {
    it('should contain HowTo structured data script', () => {
      const { container } = render(<HowToSection />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
    });

    it('should have valid HowTo schema structure', () => {
      const { container } = render(<HowToSection />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const schema = JSON.parse(script!.innerHTML);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('HowTo');
      expect(schema.name).toBe('How to Check Who Unfollowed You on Instagram Without Login');
      expect(schema.totalTime).toBe('PT5M');
    });

    it('should include all steps in schema', () => {
      const { container } = render(<HowToSection />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const schema = JSON.parse(script!.innerHTML);

      expect(schema.step).toHaveLength(8);
      expect(schema.step[0]['@type']).toBe('HowToStep');
      expect(schema.step[0].position).toBe(1);
      expect(schema.step[0].name).toBe('Open Data Export Page');
    });

    it('should include supplies and tools in schema', () => {
      const { container } = render(<HowToSection />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const schema = JSON.parse(script!.innerHTML);

      expect(schema.supply).toHaveLength(2);
      expect(schema.supply[0].name).toBe('Instagram account');
      expect(schema.tool).toHaveLength(1);
      expect(schema.tool[0].name).toBe('Instagram Unfollow Tracker (this website)');
    });

    it('should include estimated cost in schema', () => {
      const { container } = render(<HowToSection />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const schema = JSON.parse(script!.innerHTML);

      expect(schema.estimatedCost).toEqual({
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0',
      });
    });
  });

  describe('CTA section', () => {
    it('should render CTA title and subtitle', () => {
      render(<HowToSection />);

      expect(screen.getByText('Ready to start?')).toBeInTheDocument();
      expect(
        screen.getByText(/Scan and process your Instagram data export privately/)
      ).toBeInTheDocument();
    });

    it('should render CTA button', () => {
      render(<HowToSection />);

      const button = screen.getByRole('button', { name: /Open Analysis Guide/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onStart callback when CTA button is clicked', () => {
      const onStart = vi.fn();
      render(<HowToSection onStart={onStart} />);

      const button = screen.getByRole('button', { name: /Open Analysis Guide/i });
      fireEvent.click(button);

      expect(onStart).toHaveBeenCalledWith(0);
    });

    it('should call onStart with step index when step is clicked', () => {
      const onStart = vi.fn();
      render(<HowToSection onStart={onStart} />);

      // Click on step 3 (index 2)
      const step3Title = screen.getByText("Check only 'Followers and following'");
      const stepElement = step3Title.closest('li');
      expect(stepElement).not.toBeNull();

      fireEvent.click(stepElement!);

      expect(onStart).toHaveBeenCalledWith(2);
    });

    it('should navigate via hash when no onStart callback provided', () => {
      render(<HowToSection />);

      const button = screen.getByRole('button', { name: /Open Analysis Guide/i });
      fireEvent.click(button);

      expect(window.location.hash).toBe('#wizard/step/1');
    });
  });
});
