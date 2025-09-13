import Foundation

final class UserService {
	static let shared = UserService()
	private init() {}

	func fetchUser(byName name: String) async throws -> UserRecord? {
		#if canImport(FirebaseCore) && canImport(FirebaseFirestore)
		let snapshot = try await FirebaseFirestore.Firestore.firestore().collection("users").document(name).getDocument()
		guard snapshot.exists, var data = snapshot.data() else { return nil }
		data["name"] = name
		let json = try JSONSerialization.data(withJSONObject: data)
		return try JSONDecoder().decode(UserRecord.self, from: json)
		#else
		throw NSError(domain: "UserService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Firestore not available"])
		#endif
	}

	func fetchNotifications() async throws -> [NotificationItem] {
		// GET {API_BASE_URL}/api/notifications
		let url = AppConfig.shared.apiBaseURL.appendingPathComponent("api/notifications")
		var request = URLRequest(url: url)
		request.httpMethod = "GET"
		request.setValue("application/json", forHTTPHeaderField: "Accept")
		let (data, response) = try await URLSession.shared.data(for: request)
		guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
			return []
		}
		if let list = try? JSONDecoder().decode([NotificationItem].self, from: data) { return list }
		return []
	}
}


