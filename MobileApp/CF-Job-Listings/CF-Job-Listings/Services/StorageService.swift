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

	struct ContractFile: Identifiable, Hashable {
		let id: String
		let name: String
		let url: URL
	}

	func listContracts(ownerEmail: String) async throws -> [ContractFile] {
		#if canImport(FirebaseStorage)
		let safeOwner = ownerEmail.replacingOccurrences(of: "[^a-zA-Z0-9@._-]", with: "_", options: .regularExpression)
		let folder = "contracts/\(safeOwner)"
		let ref = storage.reference(withPath: folder)
		let list = try await ref.listAll()
		var results: [ContractFile] = []
		for item in list.items {
			let url = try await item.downloadURL()
			results.append(.init(id: item.name, name: item.name, url: url))
		}
		return results.sorted { $0.name < $1.name }
		#else
		throw NSError(domain: "StorageService", code: -1, userInfo: [NSLocalizedDescriptionKey: "FirebaseStorage not available"]) 
		#endif
	}
}


