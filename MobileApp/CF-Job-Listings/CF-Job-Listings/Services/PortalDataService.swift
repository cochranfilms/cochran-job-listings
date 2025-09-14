import Foundation
#if canImport(FirebaseCore)
import FirebaseCore
#endif
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif
#if canImport(FirebaseStorage)
import FirebaseStorage
#endif

struct AssignedJob: Identifiable, Hashable {
    let id: String
    let title: String
    let location: String?
    let date: String?
    let pay: String?
    let status: String?
}

struct EquipmentItem: Identifiable, Hashable {
    let id: String
    let name: String
    let status: String?
    let available: Bool
}

struct CommunityPost: Identifiable, Hashable {
    let id: String
    let author: String
    let message: String
    let timestamp: Date?
}

struct PerformanceEntry: Identifiable, Hashable {
    let id: String
    let metric: String
    let value: String
    let date: String?
}

struct ProjectShowcaseItem: Identifiable, Hashable {
    let id: String
    let title: String
    let mediaURL: String?
}

enum PortalDataService {
    #if canImport(FirebaseFirestore)
    static func fetchAssignedJobs(email: String, name: String) async -> [AssignedJob] {
        let db = Firestore.firestore()
        var results: [AssignedJob] = []
        // Strategy 1: jobs collection with assignees containing email
        do {
            let snap = try await db.collection("jobs").whereField("assignees", arrayContains: email).getDocuments()
            for d in snap.documents {
                let data = d.data()
                results.append(AssignedJob(id: d.documentID,
                                           title: (data["title"] as? String) ?? (data["role"] as? String) ?? "Job",
                                           location: data["location"] as? String,
                                           date: (data["date"] as? String) ?? (data["projectStart"] as? String),
                                           pay: (data["pay"] as? String) ?? (data["rate"] as? String),
                                           status: (data["status"] as? String)))
            }
        } catch { }
        return results
    }

    static func fetchEquipment() async -> [EquipmentItem] {
        let db = Firestore.firestore()
        var items: [EquipmentItem] = []
        do {
            let snap = try await db.collection("equipment").getDocuments()
            for d in snap.documents {
                let data = d.data()
                items.append(EquipmentItem(id: d.documentID,
                                           name: (data["name"] as? String) ?? d.documentID,
                                           status: data["status"] as? String,
                                           available: (data["available"] as? Bool) ?? true))
            }
        } catch { }
        return items
    }

    static func reserveEquipment(id: String, userEmail: String) async throws {
        let db = Firestore.firestore()
        try await db.collection("equipment").document(id).setData([
            "available": false,
            "reservedBy": userEmail,
            "reservedAt": FieldValue.serverTimestamp()
        ], merge: true)
    }

    static func fetchCommunity() async -> [CommunityPost] {
        let db = Firestore.firestore()
        var posts: [CommunityPost] = []
        do {
            let snap = try await db.collection("community").order(by: "timestamp", descending: true).limit(to: 50).getDocuments()
            for d in snap.documents {
                let data = d.data()
                posts.append(CommunityPost(id: d.documentID,
                                           author: (data["author"] as? String) ?? "",
                                           message: (data["message"] as? String) ?? "",
                                           timestamp: (data["timestamp"] as? Timestamp)?.dateValue()))
            }
        } catch { }
        return posts
    }

    static func addCommunityPost(author: String, message: String) async throws {
        let db = Firestore.firestore()
        _ = try await db.collection("community").addDocument(data: [
            "author": author,
            "message": message,
            "timestamp": FieldValue.serverTimestamp()
        ])
    }

    static func fetchPerformance(email: String) async -> [PerformanceEntry] {
        let db = Firestore.firestore()
        var out: [PerformanceEntry] = []
        do {
            let snap = try await db.collection("performance").whereField("email", isEqualTo: email).getDocuments()
            for d in snap.documents {
                let data = d.data()
                out.append(PerformanceEntry(id: d.documentID,
                                            metric: (data["metric"] as? String) ?? "score",
                                            value: String(describing: data["value"] ?? ""),
                                            date: data["date"] as? String))
            }
        } catch { }
        return out
    }

    static func fetchProjects() async -> [ProjectShowcaseItem] {
        let db = Firestore.firestore()
        var out: [ProjectShowcaseItem] = []
        do {
            let snap = try await db.collection("projects").getDocuments()
            for d in snap.documents {
                let data = d.data()
                out.append(ProjectShowcaseItem(id: d.documentID, title: (data["title"] as? String) ?? d.documentID, mediaURL: data["mediaURL"] as? String))
            }
        } catch { }
        return out
    }

    static func fetchSuccessStories() async -> [[String: Any]] {
        let db = Firestore.firestore()
        var out: [[String: Any]] = []
        do {
            let snap = try await db.collection("successStories").order(by: "createdAt", descending: true).limit(to: 50).getDocuments()
            for d in snap.documents { out.append(d.data()) }
        } catch { }
        return out
    }

    static func uploadShowcase(ownerEmail: String, data: Data, filename: String, mime: String) async throws -> String {
        #if canImport(FirebaseStorage)
        let storage = Storage.storage()
        let safeOwner = ownerEmail.replacingOccurrences(of: "[^a-zA-Z0-9@._-]", with: "_", options: .regularExpression)
        let path = "community-showcases/\(safeOwner)/\(Int(Date().timeIntervalSince1970))_\(filename)"
        let ref = storage.reference(withPath: path)
        let md = StorageMetadata(); md.contentType = mime
        _ = try await ref.putDataAsync(data, metadata: md)
        let url = try await ref.downloadURL()
        return url.absoluteString
        #else
        throw NSError(domain: "PortalDataService", code: -1, userInfo: [NSLocalizedDescriptionKey: "FirebaseStorage not available"])
        #endif
    }
    #endif
}


