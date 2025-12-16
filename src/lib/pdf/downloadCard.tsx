// components/membership/MembershipCardPDF.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer'
import { Badge } from '@/components/ui/badge'

// Optional: Add a nice font
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium.ttf',
})

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#f9fafb' },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: { width: 60, height: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: { fontSize: 11, color: '#6b7280' },
  value: { fontSize: 12, fontWeight: 'bold' },
  badge: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
  },
})

export const MembershipCardPDF = ({ member }: { member: any }) => {
  const m = member.membership

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Library Card</Text>
              <Text style={styles.subtitle}>National Digital Library</Text>
            </View>
            {/* Optional: Add your library logo */}
            {/* <Image style={styles.logo} src="/logo.png" /> */}
          </View>

          <Image
            style={styles.avatar}
            src={member.photo || '/default-avatar.png'}
          />

          <Text style={styles.name}>
            {member.first_name} {member.last_name}
          </Text>

          <View style={{ marginVertical: 16 }}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Member ID</Text>
              <Text style={styles.value}>
                LHR-{member.id.toString().padStart(5, '0')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Plan</Text>
              <Text style={styles.value}>{m.plan.replace('-', ' ')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Valid Until</Text>
              <Text style={styles.value}>
                {new Date(m.end_date).toLocaleDateString('en-GB')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status</Text>
              <Text
                style={{
                  ...styles.badge,
                  backgroundColor:
                    m.is_active && !m.is_expired ? '#10b981' : '#ef4444',
                  color: 'white',
                }}
              >
                {m.is_active && !m.is_expired ? 'ACTIVE' : 'EXPIRED'}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text>Thank you for being a valued member!</Text>
            <Text>library@example.com • +92 300 1234567</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
