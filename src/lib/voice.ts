import { apiFetch } from "./api";

/** Starts recording. Call the returned function to stop and get the audio. */
export async function startRecording(): Promise<() => Promise<Blob>> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.start();
    return () =>
        new Promise<Blob>((resolve) => {
            recorder.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());     // turns the mic light off
                resolve(new Blob(chunks, { type: recorder.mimeType }));
            };
            recorder.stop();
        });
}

/** "/voice/transcribe" returns {text}; "/voice/values" also returns {values} found in the speech. */
export function transcribe(audio: Blob, endpoint: "/voice/transcribe" | "/voice/values" = "/voice/transcribe") {
    const form = new FormData();
    form.append("audio", audio, "speech.webm");
    return apiFetch(endpoint, { method: "POST", body: form });
}

export function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();                      // stop anything already speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.9;                                 // a little slower for elderly listeners
    window.speechSynthesis.speak(utterance);
}