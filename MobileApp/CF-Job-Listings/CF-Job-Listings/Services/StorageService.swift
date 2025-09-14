import Foundation
#if canImport(FirebaseCore)
import FirebaseCore
#endif
#if canImport(FirebaseStorage)
import FirebaseStorage
#endif

final class StorageService {
	static let shared = StorageService()
	private init() {}

	#if canImport(FirebaseStorage)
	private var storage: Storage { Storage.storage() }
	#endif

	func uploadContract(data: Data, ownerEmail: String, filename: String) async throws -> (url: URL, path: String) {
		#if canImport(FirebaseStorage)
		let safeOwner = ownerEmail.replacingOccurrences(of: "[^a-zA-Z0-9@._-]", with: "_", options: .regularExpression)
		let path = "contracts/\(safeOwner)/\(filename)"
		let ref = storage.reference(withPath: path)
		let metadata = StorageMetadata()
		metadata.contentType = "application/pdf"
		_ = try await ref.putDataAsync(data, metadata: metadata)
		let url = try await ref.downloadURL()
		return (url, path)
		#else
		throw NSError(domain: "StorageService", code: -1, userInfo: [NSLocalizedDescriptionKey: "FirebaseStorage not available"])
		#endif
	}

	func uploadMessageAttachment(data: Data, mime: String, conversationId: String, suggestedName: String) async throws -> (url: URL, path: String) {
		#if canImport(FirebaseStorage)
		let name = "\(Int(Date().timeIntervalSince1970))_\(suggestedName)"
		let path = "messageAttachments/\(conversationId)/\(name)"
		let ref = storage.reference(withPath: path)
		let metadata = StorageMetadata(); metadata.contentType = mime
		_ = try await ref.putDataAsync(data, metadata: metadata)
		let url = try await ref.downloadURL()
		return (url, path)
		#else
		throw NSError(domain: "StorageService", code: -1, userInfo: [NSLocalizedDescriptionKey: "FirebaseStorage not available"])
		#endif
	}
}


