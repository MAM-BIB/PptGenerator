using System;
using System.Collections.Generic;
using System.Text;

namespace PptGenerator.TemplateInfo {
    class Slide {
        private string _relationshipId;
        private string _uid;
        private uint _position;
        private string _title;
        private bool _isHidden;
        private List<String> _placeholder;

        public string RelationshipId { get => _relationshipId; set => _relationshipId = value; }
        public string Uid { get => _uid; set => _uid = value; }
        public uint Position { get => _position; set => _position = value; }
        public bool IsHidden { get => _isHidden; set => _isHidden = value; }
        public string Title { get => _title; set => _title = value; }
        public List<string> Placeholder { get => _placeholder; set => _placeholder = value; }

        public Slide(string relationshipId, string uid, uint position, string title, bool isHidden = false, List<String> placeholder = null) {
            RelationshipId = relationshipId;
            Uid = uid;
            Position = position;
            Title = title;
            IsHidden = isHidden;
            Placeholder = placeholder == null ? new List<string>() : placeholder;
        }

        public override bool Equals(object obj) {
            if (Uid == null) {
                return obj is Slide slide && 
                    slide.Uid == null && 
                    slide.RelationshipId == RelationshipId;
            } else {
                return obj is Slide slide &&
                       Uid == slide.Uid;
            }
        }

        public override int GetHashCode() {
            return HashCode.Combine(Uid);
        }

        public override string ToString() {
            return $"{Position}: {Uid}, {RelationshipId}";
        }
    }
}
