"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import Visualizer from "@/components/Visualizer";
import {
  AgentState,
  DisconnectButton,
  LiveKitRoom,
  RoomAudioRenderer,
  TrackReference,
  TrackReferenceOrPlaceholder,
  VoiceAssistantControlBar,
  useChat,
  useLocalParticipant,
  useTrackTranscription,
  useVoiceAssistant,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { LocalParticipant, MediaDeviceFailure, Participant, Track, TranscriptionSegment } from "livekit-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "./context/UserContext";
import { ConnectionDetails } from "./web-api/v1/connection-details/route";

export type ChatMessageType = {
  name: string;
  message: string;
  isSelf: boolean;
  timestamp: number;
};

export interface User {
  id: string;
  email: string;
  chapter: string;
}
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Page() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useUser();

  const onConnectButtonClicked = useCallback(async () => {
    // Generate room connection details, including:
    //   - A random Room name
    //   - A random Participant name
    //   - An Access Token to permit the participant to join the room
    //   - The URL of the LiveKit server to connect to
    //
    // In real-world application, you would likely allow the user to specify their
    // own participant name, and possibly to choose from existing rooms to join.
    
    const baseUrl = window.location.origin; // Get the base URL of the current location
    
    const url = new URL(
      user ? `/web-api/v1/connection-details?uid=${user?.id}&cid=${user?.chapter}` : `/web-api/v1/connection-details`,
      baseUrl
    );

    const response = await fetch(url.toString());
    const connectionDetailsData = await response.json();
    updateConnectionDetails(connectionDetailsData);
  }, [user]);


  const voiceAssistantComponentProps = {
    agentState,
    setAgentState,
    onConnectButtonClicked,
    isAnimating,
    setIsAnimating
  }

  return (
    <main
      data-lk-theme="default"
      className="h-full grid content-center bg-white"
    >
      <LiveKitRoom
        token={connectionDetails?.participantToken}
        serverUrl={connectionDetails?.serverUrl}
        connect={connectionDetails !== undefined}
        audio={true}
        video={false}
        onMediaDeviceFailure={onDeviceFailure}
        onDisconnected={() => {
          updateConnectionDetails(undefined);
          setIsAnimating(false);
        }}
        className="grid grid-rows-[2fr_1fr] items-center bg-white"
      >
        <VoiceAssistantComponents {...voiceAssistantComponentProps} />
      </LiveKitRoom>
    </main>
  );
}

function SimpleVoiceAssistant(props: {
  onStateChange: (state: AgentState) => void,
  state: AgentState,
  audioTrack: TrackReference | undefined,
  isAnimating: boolean;
}) {
  const { state, audioTrack } = props;
  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);
  return (
    <div className=" mx-auto relative h-full">
      <Visualizer
        state={state}
        trackRef={audioTrack}
        isAnimating={props.isAnimating}
      />
    </div>
  );
}


function ControlBar(props: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
  roomTranscript: ChatMessageType[];
  setIsAnimating: (isAnimating: boolean) => void;
}) {
  
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);

  useEffect(() => {
    let track: MediaStreamTrack | null = null; // Declare track inside useEffect

    async function enableNoiseSuppression() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
          },
        });

        track = stream.getAudioTracks()[0];
        setAudioTrack(track);

        console.log('audioTrack:', audioTrack);
        
      } catch (error) {
        console.error("Error enabling noise suppression:", error);
      }
    }

    enableNoiseSuppression();

    return () => {
      if (track) track.stop(); // Clean up track when component unmounts
    };
  }, []); // ✅ No unnecessary dependencies

  const { user } = useUser();

  const storeTranscript = useCallback(async (roomTranscript: ChatMessageType[]) => {
    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('.')[0];
      const response = await fetch(`${BACKEND_URL}/transcript/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "chapterId": user?.chapter,
          "transcript": JSON.stringify(roomTranscript),
          "accountId": user?.id,
          "timestamp": formattedDate
        }),
      });


      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Handle the story as needed
    } catch (error) {
      console.error('Error generating story:', error);
    }
  }, []);

  const handleStartAConversationClicked = () => {
    props.onConnectButtonClicked();
    props.setIsAnimating(true);
  };

  return (
    <div className="relative h-[100px]">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 mt-20 bg-black text-white rounded-md"
            onClick={() => handleStartAConversationClicked()}
          >
            Start interview
          </motion.button>
        )}
      </AnimatePresence>

      {/* Generate story button hidden for now */}
      {/* <AnimatePresence>
        {props.agentState === "disconnected" && props.roomTranscript.length > 1 && (
          <motion.button
            initial={{ opacity: 0, top: 50 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="bg-black uppercase absolute mt-[140px] left-1/2 -translate-x-1/2 rounded-md px-4 py-2 text-white "
            onClick={() => generateStory(props.roomTranscript)}
          >
            Generate Story 
						{loading && (
							<div className="spinner absolute left-1/2 -translate-x-1/2 top-20">
								<svg
									className="animate-spin h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									></path>
								</svg>
							</div>
						)}
          </motion.button>
        )} 
      </AnimatePresence> */}
      <AnimatePresence>
        {props.agentState !== "disconnected" &&
          props.agentState !== "connecting" && (
            <motion.div
              initial={{ opacity: 0, top: "10px" }}
              animate={{ opacity: 1, top: 0 }}
              exit={{ opacity: 0, top: "-10px" }}
              transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
              className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
              onClick={() => {
                console.log('triggered control');
              }}
            >
              <VoiceAssistantControlBar controls={{ leave: false }} />
              <DisconnectButton onClick={() => storeTranscript(props.roomTranscript)}>
                <CloseIcon />
              </DisconnectButton>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}


function VoiceAssistantComponents(props: {
  agentState: AgentState,
  setAgentState: (state: AgentState) => void,
  onConnectButtonClicked: () => void,
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
}) {
  const { setAgentState, onConnectButtonClicked, agentState, isAnimating } = props;
  const [roomTranscript, setRoomTranscript] = useState<ChatMessageType[]>([]); // State for messages

  const { state, audioTrack } = useVoiceAssistant();
  const simpleVideoAssistantProps = {
    onStateChange: setAgentState,
    state,
    audioTrack,
    isAnimating,
  }

  const chatTileContent = useMemo(() => {
    if (audioTrack) {
      return (
        <TranscriptionTile
          agentAudioTrack={audioTrack}
          setRoomTranscript={setRoomTranscript}
        />
      );
    }
    return null;
  }, [audioTrack]);

  return (
    <>
      <SimpleVoiceAssistant {...simpleVideoAssistantProps} />
      <ControlBar
        onConnectButtonClicked={onConnectButtonClicked}
        agentState={agentState}
        roomTranscript={roomTranscript}
        setIsAnimating={props.setIsAnimating}
      />
      <RoomAudioRenderer />
      <NoAgentNotification state={agentState} />
      {chatTileContent}
    </>
  )
}

function TranscriptionTile({
  agentAudioTrack,
  setRoomTranscript,
}: {
  agentAudioTrack: TrackReferenceOrPlaceholder;
  setRoomTranscript: (transcript: ChatMessageType[]) => void,
}) {
  const agentMessages = useTrackTranscription(agentAudioTrack);
  const localParticipant = useLocalParticipant();
  const localMessages = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  const [transcripts, setTranscripts] = useState<Map<string, ChatMessageType>>(
    new Map()
  );
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const { chatMessages } = useChat();

  // store transcripts
  useEffect(() => {
    setTranscripts((prevTranscripts) => {
      const newTranscripts = new Map(prevTranscripts);
  
      agentMessages.segments.forEach((s) =>
        newTranscripts.set(
          s.id,
          segmentToChatMessage(s, prevTranscripts.get(s.id), agentAudioTrack.participant)
        )
      );
  
      localMessages.segments.forEach((s) =>
        newTranscripts.set(
          s.id,
          segmentToChatMessage(s, prevTranscripts.get(s.id), localParticipant.localParticipant)
        )
      );
  
      return newTranscripts;
    });
  
    setMessages(() => {
      const allMessages = Array.from(transcripts.values());
  
      for (const msg of chatMessages) {
        const isAgent = msg.from?.identity === agentAudioTrack.participant?.identity;
        const isSelf = msg.from?.identity === localParticipant.localParticipant.identity;
        const name = msg.from?.name ?? (isAgent ? "Agent" : isSelf ? "You" : "Unknown");
  
        allMessages.push({
          name,
          message: msg.message,
          timestamp: msg.timestamp,
          isSelf,
        });
      }
  
      return [...allMessages].sort((a, b) => a.timestamp - b.timestamp);
    });
  
  }, [
    chatMessages,
    agentAudioTrack.participant,
    localParticipant.localParticipant,
    agentMessages.segments,
    localMessages.segments,
  ]);
  
  

  useEffect(() => {
    // Assuming setRoomTranscript is passed from the parent
    setRoomTranscript(messages);
  }, [messages, setRoomTranscript]);
  const styles = {
    container: {
      position: 'relative' as const,
      height: '200px',
      color: 'black',
      overflow: 'scroll' as const,
      backgroundColor: 'rgb(241 241 241)',
      padding: '10px',
    },
  };

  return (
    <>
      <div style={styles.container}>
        {messages.map((message, index) => (
          <div key={index}>
            {message.name === 'Agent' ? 'Narra' : message.name} - {message.message}
          </div>
        ))}
      </div>
    </>
  );
}

function segmentToChatMessage(
  s: TranscriptionSegment,
  existingMessage: ChatMessageType | undefined,
  participant: Participant
): ChatMessageType {
  const msg: ChatMessageType = {
    message: s.final ? s.text : `${s.text} ...`,
    name: participant instanceof LocalParticipant ? "You" : "Agent",
    isSelf: participant instanceof LocalParticipant,
    timestamp: existingMessage?.timestamp ?? Date.now(),
  };
  return msg;
}