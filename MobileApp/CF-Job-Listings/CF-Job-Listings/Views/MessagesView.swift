import SwiftUI

struct MessagesView: View {
	@StateObject private var auth = AuthService.shared
	@StateObject private var service = MessagingService.shared
	@State private var selectedConv: Conversation?

	var body: some View {
		NavigationStack {
			List(service.conversations) { conv in
				Button {
					selectedConv = conv
				} label: {
					HStack {
						VStack(alignment: .leading) {
							Text(conv.participants.joined(separator: ", ")).font(.headline)
							Text(conv.lastMessage ?? "").font(.subheadline).foregroundColor(.secondary)
						}
						Spacer()
						if let ts = conv.lastMessageTime { Text(ts, style: .time).font(.caption).foregroundColor(.secondary) }
					}
				}
			}
			.navigationTitle("Messages")
		}
		.sheet(item: $selectedConv) { conv in
			ThreadView(conversation: conv)
		}
		.onAppear {
			if let email = auth.currentEmail { service.listenConversations(forEmail: email) }
		}
	}
}

struct ThreadView: View {
	let conversation: Conversation
	@State private var text: String = ""
	@StateObject private var auth = AuthService.shared

	var body: some View {
		NavigationStack {
			VStack {
				List { /* future: live messages */ }
				HStack {
					TextField("Message", text: $text)
						.textFieldStyle(.roundedBorder)
					Button("Send") { Task { await send() } }
				}
				.padding()
			}
			.navigationTitle("Chat")
		}
	}

	private func send() async {
		guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
		guard let email = auth.currentEmail else { return }
		do { try await MessagingService.shared.sendMessage(conversationId: conversation.id, senderEmail: email, text: text); text = "" } catch { }
	}
}


