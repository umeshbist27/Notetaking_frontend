import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NoteActionsMenu from "../pages/NotePDFExporter";

const mockSetFontSize = jest.fn();
const mockText = jest.fn();
const mockSplitTextToSize = jest.fn((text) => text.split("\n"));
const mockGetImageProperties = jest.fn(() => ({ width: 100, height: 100 }));
const mockAddImage = jest.fn();
const mockAddPage = jest.fn();
const mockTextWithLink = jest.fn();
const mockSetTextColor = jest.fn();
const mockSave = jest.fn();

jest.mock("jspdf", () => ({
  jsPDF: jest.fn(() => ({
    setFontSize: mockSetFontSize,
    text: mockText,
    splitTextToSize: mockSplitTextToSize,
    getImageProperties: mockGetImageProperties,
    addImage: mockAddImage,
    addPage: mockAddPage,
    textWithLink: mockTextWithLink,
    setTextColor: mockSetTextColor,
    save: mockSave,
  })),
}));

beforeAll(() => {
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterAll(() => {
  (window.alert as jest.Mock).mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
});

const title = "Test Note";

describe("NoteActionsMenu handleDownload full coverage", () => {
  it("handles empty content and returns early", async () => {
    render(<NoteActionsMenu title={title} content="" />);
    fireEvent.click(screen.getByRole("button"));
    const downloadBtn = await screen.findAllByRole("button");
    fireEvent.click(downloadBtn[1]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Note content not found!");
    });
  });

  it("handles image with y + pdfHeight > 280", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      blob: () => new Blob(["fake"]),
    }) as jest.Mock;

    const mockFileReader = {
      readAsDataURL: jest.fn(function () {
        if (mockFileReader.onloadend) mockFileReader.onloadend();
      }),
      onloadend: null as null | (() => void),
      result: "data:image/jpeg;base64,FAKE_IMAGE",
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    mockGetImageProperties.mockReturnValueOnce({ width: 100, height: 300 });

    const content = `<p>Text</p><img src="http://image.url/big.jpg"/>`;

    render(<NoteActionsMenu title={title} content={content} />);
    fireEvent.click(screen.getByRole("button"));
    const downloadBtn = await screen.findAllByRole("button");
    fireEvent.click(downloadBtn[1]);

    await waitFor(() => {
      expect(mockAddPage).toHaveBeenCalled();
      expect(mockAddImage).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });
  });

  it("handles image with y + pdfHeight <= 280", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      blob: () => new Blob(["fake"]),
    }) as jest.Mock;

    const mockFileReader = {
      readAsDataURL: jest.fn(function () {
        if (mockFileReader.onloadend) mockFileReader.onloadend();
      }),
      onloadend: null as null | (() => void),
      result: "data:image/jpeg;base64,FAKE_IMAGE",
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    mockGetImageProperties.mockReturnValueOnce({ width: 100, height: 50 });

    const content = `<p>Text</p><img src="http://image.url/small.jpg"/>`;

    render(<NoteActionsMenu title={title} content={content} />);
    fireEvent.click(screen.getByRole("button"));
    const downloadBtn = await screen.findAllByRole("button");
    fireEvent.click(downloadBtn[1]);

    await waitFor(() => {
      expect(mockAddPage).not.toHaveBeenCalled();
      expect(mockAddImage).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });
  });

  it("handles image fetch error (catch branch)", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("fetch failed")) as jest.Mock;

    const content = `<p>Text</p><img src="http://broken.url/fail.jpg"/>`;

    render(<NoteActionsMenu title={title} content={content} />);
    fireEvent.click(screen.getByRole("button"));
    const downloadBtn = await screen.findAllByRole("button");
    fireEvent.click(downloadBtn[1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
describe("NoteActionsMenu handleShare full coverage", () => {
  it("shares successfully if Web Share API is supported", async () => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      writable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });

    const content = `<p>Test</p><img src="http://image.url/test.jpg"/>`;
    render(<NoteActionsMenu title="Share Test" content={content} />);

    fireEvent.click(screen.getByRole("button"));
    const buttons = await screen.findAllByRole("button");
    fireEvent.click(buttons[2]);

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalled();
    });
  });

  it("alerts when navigator.share throws an error", async () => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      writable: true,
      value: jest.fn().mockRejectedValueOnce(new Error("fail")),
    });

    const content = `<p>Test</p>`;
    render(<NoteActionsMenu title="Share Fail" content={content} />);

    fireEvent.click(screen.getByRole("button"));
    const buttons = await screen.findAllByRole("button");
    fireEvent.click(buttons[2]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Sharing failed or cancelled.");
    });
  });

  it("alerts when navigator.share is not supported", async () => {
    delete (navigator as any).share;

    const content = `<p>Test</p>`;
    render(<NoteActionsMenu title="No Share" content={content} />);

    fireEvent.click(screen.getByRole("button"));
    const buttons = await screen.findAllByRole("button");
    fireEvent.click(buttons[2]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Sharing is not supported on this browser."
      );
    });
  });
  it("uses default fallback title if none is provided", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      blob: () => new Blob(["fake"]),
    }) as jest.Mock;

    const mockFileReader = {
      readAsDataURL: jest.fn(function () {
        if (mockFileReader.onloadend) mockFileReader.onloadend();
      }),
      onloadend: null as null | (() => void),
      result: "data:image/jpeg;base64,FAKE_IMAGE",
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    const content = `<p>Test</p><img src="http://image.url/test.jpg"/>`;
    render(<NoteActionsMenu title="" content={content} />);

    fireEvent.click(screen.getByRole("button"));
    const downloadBtn = await screen.findAllByRole("button");
    fireEvent.click(downloadBtn[1]);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith("Untitled_Note.pdf");
    });
  });
  it("uses fallback title for PDF and Share if title is empty", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      blob: () => new Blob(["fake"]),
    }) as jest.Mock;

    const mockFileReader = {
      readAsDataURL: jest.fn(function () {
        if (mockFileReader.onloadend) mockFileReader.onloadend();
      }),
      onloadend: null as null | (() => void),
      result: "data:image/jpeg;base64,FAKE_IMAGE",
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    Object.defineProperty(navigator, "share", {
      configurable: true,
      writable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });

    const content = `<p>Text</p><img src="http://image.url/fake.jpg"/>`;
    render(<NoteActionsMenu title="" content={content} />);

    // Open menu
    fireEvent.click(screen.getByRole("button"));
    const buttons = await screen.findAllByRole("button");

    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith("Untitled_Note.pdf");
    });

    fireEvent.click(screen.getByRole("button"));
    const shareButtons = await screen.findAllByRole("button");

    fireEvent.click(shareButtons[2]);

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Untitled Note",
          text: expect.stringContaining("Untitled Note"),
        })
      );
    });
  });
  it("uses fallback title in share when title and content are empty", async () => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      writable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });

    render(<NoteActionsMenu title="" content="" />);
    fireEvent.click(screen.getByRole("button"));

    const buttons = await screen.findAllByRole("button");
    fireEvent.click(buttons[2]);

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Untitled Note",
          text: expect.stringContaining("Untitled Note"),
        })
      );
    });
  });
});
